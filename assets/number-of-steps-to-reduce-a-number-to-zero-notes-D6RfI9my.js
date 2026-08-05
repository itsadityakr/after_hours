var e=`Count the steps to reach zero, where a step is: halve it if it is even, subtract
one if it is odd. There is no choice to make and nothing to search for — the rule
tells you what to do at every number, so the answer is "run it and count".

## 1. The problem

Given a non-negative integer \`num\`, return the number of steps needed to reduce
it to 0.

- **In** — \`num\`, an \`int\`, and \`0 <= num <= 10⁶\`.
- **Out** — the step count, as an \`int\`.
- **A step** — if \`num\` is even, halve it; if it is odd, subtract 1.

**\`num\` can be 0**, and the answer is 0 — no steps are needed because you are
already there. That is the input most wrong submissions get wrong, and section 3
shows why it needs no special case.

Nothing here is a choice. At every number exactly one of the two rules applies,
so there is no branch to explore and nothing to optimise. The whole question is
whether you can turn a stated rule into a loop that terminates.

## 2. The brute force

Apply the rule until you land on zero, counting as you go.

\`\`\`java Steps.java @run-number-of-steps-to-reduce-a-number-to-zero-steps
static int numberOfSteps(int num) {

    int count = 0;

    while (num != 0) {

        if (num % 2 == 0) {
            num /= 2;
        } else {
            num -= 1;
        }

        count++;
    }

    return count;
}
\`\`\`

\`\`\`output @run-number-of-steps-to-reduce-a-number-to-zero-steps
numberOfSteps(0)       -> 0
numberOfSteps(1)       -> 1
numberOfSteps(8)       -> 4
numberOfSteps(14)      -> 6
numberOfSteps(123)     -> 12
numberOfSteps(1000000) -> 26
\`\`\`

\`\`\`demo Steps.java
numberOfSteps(0)
numberOfSteps(1)
numberOfSteps(8)
numberOfSteps(14)
numberOfSteps(123)
numberOfSteps(1000000)
\`\`\`

### The code, line by line

- \`int count = 0;\` — the answer being built. It counts *steps taken*, not numbers
  visited, and those differ by one.
- \`while (num != 0)\` — **the condition is written from the destination, not from
  the input.** "Stop when you reach zero" is exactly \`num != 0\`, and written that
  way 0 never enters the loop and comes straight back as 0.
- \`if (num % 2 == 0)\` — even. \`% 2\` is 0 for even numbers and 1 for odd ones, and
  since \`num\` is never negative here there is no sign case to worry about.
- \`num /= 2;\` — the halving. Integer division is exact on an even number, so
  nothing is lost.
- \`num -= 1;\` — the odd branch. Note what it does: it makes the number **even**,
  so the very next step is guaranteed to be a halving.
- \`count++;\` — **once, after the branch, not once in each arm.** Both are
  correct; only one of them has a single place to be wrong. Two counters in two
  branches are two places for the same fact, and eventually they disagree.
- \`return count;\` — reached when \`num\` is 0.

## 3. Dry run of the brute force

\`num = 14\`. One row per turn of the loop.

| step | num | even or odd | what happens | num after | count after |
|---|---|---|---|---|---|
| 1 | 14 | even | halve | 7 | 1 |
| 2 | 7 | odd | subtract 1 | 6 | 2 |
| 3 | 6 | even | halve | 3 | 3 |
| 4 | 3 | odd | subtract 1 | 2 | 4 |
| 5 | 2 | even | halve | 1 | 5 |
| 6 | 1 | odd | subtract 1 | 0 | 6 |
| end | 0 | — | \`num != 0\` is false, loop stops | 0 | **6** |

The same run as a chain — orange is a subtraction, blue a halving:

![3. Dry run of the brute force — diagram](diagrams/number-of-steps-to-reduce-a-number-to-zero-notes-mm-1.jpg)

**Read the colours and one thing jumps out: they alternate.** An odd number is
never halved on the spot — the subtraction goes first and makes it even, and the
halving comes next. So you never get two subtractions in a row, and that fact is
the whole termination argument.

Now \`num = 0\`:

| step | what happens |
|---|---|
| — | \`0 != 0\` is false, so the loop body never runs |
| — | \`return count\` → **0** |

**The edge case is handled by not writing one.** Because the condition asks about
the destination rather than the input, zero answers itself.

## 4. Why it is not enough

It is enough. There is no faster answer to find here, and inventing a slower
version to reject would be dishonest — the rule is deterministic, so every
solution walks the same chain.

What is worth being able to prove is that the chain **is** short. Take any two
consecutive steps: either the number was even and halved on the spot, or it was
odd, a subtraction made it even, and the halving came next. Either way the number
has at least halved every two steps.

So the work is the number of times \`num\` can be halved before reaching zero, with
at most one subtraction in front of each halving — **O(log num)**, and space
O(1). At the top of the constraints, 10⁶, that is about forty steps. For the whole
\`int\` range it never passes sixty.

That argument is the thing being tested. "It terminates because the number gets
smaller" is not enough on its own — subtracting 1 makes it smaller too, and if
that could happen repeatedly the count would be linear. You need the observation
that a subtraction always hands the next step an even number.

The only follow-up worth having ready: **the same count in binary.** Halving is a
right shift and subtracting one from an odd number clears its lowest bit, so the
answer is the number of bits, plus the number of set bits, minus one. Work that
out from the chain above and you will see why.

## 5. Key takeaways

- **Write the loop condition from the goal, not from the input.** \`num != 0\` is
  the specification, and it makes \`num = 0\` correct without a special case.
- **One \`count++\`, after the branch.** Two counters in two arms are two places
  for one fact.
- **A subtraction always produces an even number**, so the two rules alternate at
  worst and the number halves every two steps. That is the termination proof and
  the complexity argument in one sentence.
- **O(log num) time, O(1) space** — about forty steps at 10⁶, never more than
  sixty for any \`int\`.
- **A recursive version is the same rule and costs a stack frame per step.** The
  steps are exactly what the problem counts, so the depth is the answer — know it
  exists, submit the loop.
`;export{e as default};