var e=`Count the steps to reach zero, where a step is: halve it if it is even, subtract
one if it is odd. There is no choice to make and nothing to optimise — the rule
tells you what to do at every number, so the answer is just "run it and count".

## The loop

\`\`\`java Steps.java @run-steps
public class Steps {

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

    public static void main(String[] args) {
        for (int n : new int[] { 14, 8, 123, 0 })
            System.out.printf("%4d  binary %-10s steps %d%n", n, Integer.toBinaryString(n), numberOfSteps(n));
    }
}
\`\`\`

\`\`\`output @run-steps
  14  binary 1110       steps 6
   8  binary 1000       steps 4
 123  binary 1111011    steps 12
   0  binary 0          steps 0
\`\`\`

## How to approach it

**1. Run one example by hand, writing the chain down.** 14 → 7 → 6 → 3 → 2 → 1 →
0. Six arrows, six steps. Doing this is also how you notice that odd numbers are
never halved directly — they always cost two steps to lose a digit.

![The chain from 14 to zero, alternating between halving and subtracting](diagrams/number-of-steps-to-reduce-a-number-to-zero-notes-chain.jpg)

**2. Write the loop condition from the goal, not from the number.** You stop
when you reach zero, so the condition is \`num != 0\` — and 0 itself then answers 0
without a special case, which is the input most solutions get wrong.

**3. Count where the counting belongs.** One \`count++\` at the end of the body
rather than one in each branch. Both are correct; one of them cannot drift.

**4. Ask why it terminates.** Halving shrinks the number and subtracting one
makes it even, so two steps at worst always shrink it. That argument is what
tells you the loop is finite, and it is the same argument that gives you the
complexity below.

## What the loop is really doing

In binary the two branches are much plainer than they look in decimal:

- \`num % 2 == 0\` is "the last bit is 0", and \`num /= 2\` is **shift right**.
- \`num -= 1\` on an odd number is "clear the last bit", which is always a 1.

So the loop shifts the number right until it is gone, and pays one extra step
for every 1 bit it clears on the way. That gives the answer in closed form:

\`\`\`text
steps = (bits − 1) + (number of 1 bits)

14 = 1110   ->  3 + 3 = 6
 8 = 1000   ->  3 + 1 = 4
\`\`\`

Worth knowing, not worth submitting instead of the loop — the loop is the
problem being asked, and the binary reading is what to say when they ask you for
the complexity.

## Time — O(log n)

Each shift removes a bit, so the halvings are the bit count, and there can be at
most one subtraction before each of them. A number has about \`log2\` of it bits,
so the whole thing is **O(log n)** — for an \`int\`, never more than about sixty
steps.

![Steps rising with the bits of the number rather than with the number](diagrams/number-of-steps-to-reduce-a-number-to-zero-notes-time.jpg)

## Space — O(1)

A counter, and the number itself being consumed in place.

![One counter whatever the number, so the memory line stays flat](diagrams/number-of-steps-to-reduce-a-number-to-zero-notes-space.jpg)

| | Cost | Why |
|---|---|---|
| Time | O(log n) | one step per bit, plus one per 1 bit |
| Space | O(1) | one counter |
`;export{e as default};