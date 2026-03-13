# Spire Jr

Spire Jr is a simple, browser-based card battler inspired by Slay the Spire.

This version is intentionally designed for preschool/kindergarten-age learners. The goal is to make early math feel playful through short turns, clear visuals, and repeated counting moments.

## Learning intent

Spire Jr helps practice:

- counting one-by-one
- basic addition (gain hearts/shields)
- basic subtraction (lose hearts/shields)
- comparing small numbers (how much damage, how much health)

Because results are shown as visible hearts/shields and animate step-by-step, kids can follow the math as it happens.

## Rough rules (kid-friendly)

1. You are the Hero. Each fight has one enemy with hearts (HP).
2. On your turn, you can play cards using energy (`⚡`). You start each turn with 3 energy.
3. Card types:
   - Attack cards remove enemy hearts.
   - Block cards add shields that absorb damage.
   - Heal cards give your hero hearts back.
4. When you press **End Turn**, the enemy attacks.
5. Remaining block is temporary and clears after enemy attacks.
6. If enemy hearts reach 0, you win the fight and pick a reward card.
7. If hero hearts reach 0, the run ends.
8. Beat all fights in the run to win.

## Run the game

### Run remotely (easiest)

Play it directly in your browser:

`https://disconaut5.github.io/spire_jr/spire.html`

### Run locally

Requirements:

- `python3`

From the project root:

```bash
./start_server.sh
```

Then open:

`http://localhost:8000/spire.html`

To use another port:

```bash
./start_server.sh 5500
```

## Run tests

From the project root:

```bash
./tests/run_tests.sh
```

This runs:

```bash
python3 -m unittest -v tests/test_spire_config.py
```
