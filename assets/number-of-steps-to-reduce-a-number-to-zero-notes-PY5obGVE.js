var e=`Count the steps to reach zero, where a step is: halve it if it is even, subtract
one if it is odd. There is no choice to make and nothing to optimise — the rule
tells you what to do at every number, so the answer is just "run it and count".

## How to approach it

**1. Run one example by hand, writing the chain down.** 14 → 7 → 6 → 3 → 2 → 1 →
0. Six arrows, six steps. Writing it out is also how you notice that an odd
number is never halved on the spot — a step goes on making it even first.

![The chain from 14 to zero, alternating between halving and subtracting](diagrams/number-of-steps-to-reduce-a-number-to-zero-notes-chain.jpg)

**2. Write the loop condition from the goal, not from the number.** You stop
when you reach zero, so the condition is \`num != 0\` — and 0 itself then answers 0
without a special case, which is the input most solutions get wrong.

**3. Count where the counting belongs.** One \`count++\` at the end of the body
rather than one in each branch. Both are correct; one of them cannot drift.

**4. Ask why it terminates.** Halving makes the number smaller, and subtracting
one from an odd number makes it even — so it is never more than two steps before
the number is halved again. That argument is what tells you the loop is finite,
and it is the same argument that gives you the complexity below.

## Approach 1 — the loop

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
numberOfSteps(14)  -> 6
numberOfSteps(8)   -> 4
numberOfSteps(123) -> 12
numberOfSteps(0)   -> 0
\`\`\`

\`\`\`demo Steps.java
numberOfSteps(14)
numberOfSteps(8)
numberOfSteps(123)
numberOfSteps(0)
\`\`\`

**\`num != 0\` is the whole specification**, written from the destination rather
than from the input. 0 never enters the loop and comes back 0, which is the edge
case handled by not writing one.

![One pass of the loop: test, branch, count, repeat](diagrams/number-of-steps-to-reduce-a-number-to-zero-notes-a1-pass.jpg)

**One \`count++\`, after the branch rather than inside both arms.** Two counters
in two branches are two places for the same fact, and two places for the same
fact eventually disagree.

## Approach 2 — the same rule, as recursion

The rule is stated in terms of itself — *one step, then keep going from the
number you land on* — so it reads naturally as a recursion, with zero as the
base case.

\`\`\`java StepsRecursive.java @run-number-of-steps-to-reduce-a-number-to-zero-steps-recursive
static int numberOfSteps(int num) {
    if (num == 0) return 0;

    return 1 + (num % 2 == 0 ? numberOfSteps(num / 2) : numberOfSteps(num - 1));
}
\`\`\`

\`\`\`output @run-number-of-steps-to-reduce-a-number-to-zero-steps-recursive
numberOfSteps(14)  -> 6
numberOfSteps(8)   -> 4
numberOfSteps(123) -> 12
numberOfSteps(0)   -> 0
\`\`\`

\`\`\`demo StepsRecursive.java
numberOfSteps(14)
numberOfSteps(8)
numberOfSteps(123)
numberOfSteps(0)
\`\`\`

The \`1 +\` is the step being taken, and it is outside the choice because both
branches take one. Written with the \`+ 1\` inside each arm it is the same answer
and the same drift the loop version avoids.

![The recursion going down to zero and the ones adding up on the way back](diagrams/number-of-steps-to-reduce-a-number-to-zero-notes-a2-stack.jpg)

**What it costs that the loop does not is the stack.** One frame per step, and
the steps are what the problem counts — so this is the version to know about and
not the version to submit. For an \`int\` the depth stays under sixty and nothing
breaks, but "it fits" is a weaker answer than "it keeps nothing".

## What the two cost

**Time is the yellow line, memory the green one.** Both count the same steps;
only one of them remembers them.

![Time and memory for both versions on one pair of axes](diagrams/number-of-steps-to-reduce-a-number-to-zero-notes-cost.jpg)

| Approach | Time | Space | |
|---|---|---|---|
| 1 — the loop | O(log n) | O(1) | **write this one** |
| 2 — recursion | O(log n) | O(log n) — one frame per step | the rule as it is stated |

Take any two consecutive steps and the number has at least halved: either it was
even and halved on the spot, or a subtraction made it even and the halving came
next. So the halvings are what the work really is, and there are as many of them
as the number of times \`n\` can be halved before it reaches zero — with at most
one subtraction in front of each. That is **O(log n)**, and for an \`int\` it is
never more than about sixty steps.
`;export{e as default};