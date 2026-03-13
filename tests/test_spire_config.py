import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SPIRE_JS = ROOT / "spire.js"
SPIRE_HTML = ROOT / "spire.html"


def _extract_block(source: str, start_pattern: str, end_pattern: str) -> str:
    pattern = re.compile(start_pattern + r"(.*?)" + end_pattern, re.S)
    match = pattern.search(source)
    if not match:
        raise AssertionError(f"Could not find block between {start_pattern!r} and {end_pattern!r}")
    return match.group(1)


def _extract_js_objects(block: str):
    return re.findall(r"\{[^{}]*\}", block, re.S)


def _extract_string(entry: str, key: str):
    match = re.search(rf"{key}:\s*'([^']*)'", entry)
    return match.group(1) if match else None


def _extract_int(entry: str, key: str):
    match = re.search(rf"{key}:\s*(\d+)", entry)
    return int(match.group(1)) if match else None


def _extract_int_list(entry: str, key: str):
    match = re.search(rf"{key}:\s*\[([^\]]*)\]", entry, re.S)
    if not match:
        return None
    return [int(value) for value in re.findall(r"\d+", match.group(1))]


def _parse_game_config(js_source: str):
    battlefields_block = _extract_block(js_source, r"battlefields:\s*\[", r"\]\s*,\s*player:")
    card_pool_block = _extract_block(js_source, r"cardPool:\s*\[", r"\]\s*,\s*enemies:")
    enemies_block = _extract_block(js_source, r"enemies:\s*\[", r"\]\s*\n\};")

    battlefields = []
    for entry in _extract_js_objects(battlefields_block):
        battlefields.append(
            {
                "id": _extract_string(entry, "id"),
                "image": _extract_string(entry, "image"),
                "position": _extract_string(entry, "position"),
            }
        )

    cards = []
    for entry in _extract_js_objects(card_pool_block):
        cards.append(
            {
                "id": _extract_string(entry, "id"),
                "type": _extract_string(entry, "type"),
                "value": _extract_int(entry, "value"),
                "cost": _extract_int(entry, "cost"),
                "label": _extract_string(entry, "label"),
                "artSrc": _extract_string(entry, "artSrc"),
            }
        )

    enemies = []
    for entry in _extract_js_objects(enemies_block):
        enemies.append(
            {
                "name": _extract_string(entry, "name"),
                "artSrc": _extract_string(entry, "artSrc"),
                "maxHp": _extract_int(entry, "maxHp"),
                "intents": _extract_int_list(entry, "intents"),
                "battlefieldId": _extract_string(entry, "battlefieldId"),
            }
        )

    deck_match = re.search(r"startingDeckIds:\s*\[([^\]]*)\]", js_source, re.S)
    if not deck_match:
        raise AssertionError("Could not find startingDeckIds in spire.js")
    starting_deck_ids = re.findall(r"'([^']+)'", deck_match.group(1))

    debug_override_match = re.search(r"debugEnemyHpOverride:\s*(null|\d+)", js_source)
    debug_override = debug_override_match.group(1) if debug_override_match else None

    player_art_match = re.search(r"player:\s*\{[^}]*artSrc:\s*'([^']+)'", js_source, re.S)
    player_art = player_art_match.group(1) if player_art_match else None

    return {
        "battlefields": battlefields,
        "cards": cards,
        "enemies": enemies,
        "starting_deck_ids": starting_deck_ids,
        "debug_override": debug_override,
        "player_art": player_art,
    }


class SpireConfigTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.js_source = SPIRE_JS.read_text(encoding="utf-8")
        cls.html_source = SPIRE_HTML.read_text(encoding="utf-8")
        cls.config = _parse_game_config(cls.js_source)

    def test_debug_enemy_hp_override_is_off(self):
        self.assertEqual(
            self.config["debug_override"],
            "null",
            "debugEnemyHpOverride should be null in normal gameplay.",
        )

    def test_card_ids_are_unique(self):
        card_ids = [card["id"] for card in self.config["cards"]]
        self.assertEqual(len(card_ids), len(set(card_ids)), "Card ids must be unique.")

    def test_starting_deck_ids_exist_in_card_pool(self):
        card_ids = {card["id"] for card in self.config["cards"]}
        missing = [card_id for card_id in self.config["starting_deck_ids"] if card_id not in card_ids]
        self.assertEqual(missing, [], f"Starting deck contains unknown card ids: {missing}")

    def test_card_values_and_costs_are_positive(self):
        for card in self.config["cards"]:
            self.assertIsInstance(card["value"], int, f"Card value missing: {card}")
            self.assertIsInstance(card["cost"], int, f"Card cost missing: {card}")
            self.assertGreater(card["value"], 0, f"Card value must be > 0: {card['id']}")
            self.assertGreaterEqual(card["cost"], 0, f"Card cost must be >= 0: {card['id']}")

    def test_card_types_are_supported(self):
        supported_types = {"attack", "block", "heal"}
        unknown = [card["id"] for card in self.config["cards"] if card["type"] not in supported_types]
        self.assertEqual(unknown, [], f"Unsupported card type(s): {unknown}")

    def test_battlefield_ids_are_unique(self):
        battlefield_ids = [battlefield["id"] for battlefield in self.config["battlefields"]]
        self.assertEqual(
            len(battlefield_ids),
            len(set(battlefield_ids)),
            "Battlefield ids must be unique.",
        )

    def test_enemy_battlefields_exist(self):
        battlefield_ids = {battlefield["id"] for battlefield in self.config["battlefields"]}
        invalid = [
            enemy["name"]
            for enemy in self.config["enemies"]
            if enemy["battlefieldId"] not in battlefield_ids
        ]
        self.assertEqual(invalid, [], f"Enemies reference unknown battlefields: {invalid}")

    def test_enemy_intents_are_valid_positive_integers(self):
        for enemy in self.config["enemies"]:
            intents = enemy["intents"]
            self.assertTrue(intents, f"Enemy must define at least one intent: {enemy['name']}")
            self.assertTrue(
                all(isinstance(intent, int) and intent > 0 for intent in intents),
                f"Enemy intents must be positive integers: {enemy['name']}",
            )

    def test_referenced_assets_exist(self):
        referenced_assets = []

        if self.config["player_art"]:
            referenced_assets.append(self.config["player_art"])

        referenced_assets.extend(card["artSrc"] for card in self.config["cards"] if card["artSrc"])
        referenced_assets.extend(enemy["artSrc"] for enemy in self.config["enemies"] if enemy["artSrc"])
        referenced_assets.extend(
            battlefield["image"] for battlefield in self.config["battlefields"] if battlefield["image"]
        )

        missing = [asset for asset in referenced_assets if not (ROOT / asset).is_file()]
        self.assertEqual(missing, [], f"Missing referenced asset file(s): {missing}")

    def test_all_get_element_by_id_calls_match_existing_html_ids(self):
        js_ids = set(re.findall(r"document\.getElementById\('([^']+)'\)", self.js_source))
        html_ids = set(re.findall(r'id="([^"]+)"', self.html_source))
        missing_ids = sorted(js_ids - html_ids)
        self.assertEqual(
            missing_ids,
            [],
            f"spire.js references id(s) not present in spire.html: {missing_ids}",
        )

    def test_html_ids_are_unique(self):
        html_ids = re.findall(r'id="([^"]+)"', self.html_source)
        duplicates = sorted({html_id for html_id in html_ids if html_ids.count(html_id) > 1})
        self.assertEqual(duplicates, [], f"Duplicate id(s) in spire.html: {duplicates}")


if __name__ == "__main__":
    unittest.main()
