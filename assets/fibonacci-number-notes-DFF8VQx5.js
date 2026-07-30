var e=`Each number is the sum of the two before it, starting 0, 1. Return the nth. The
definition is recursive and the answer does not have to be — this is the first
problem on the sheet where the obvious translation of the words is the expensive
one.

## How to approach it

**1. Write the first ten out.** 0 1 1 2 3 5 8 13 21 34. You now have your own
test data, and you can see that the sequence only ever looks backwards two
places.

**2. Notice what one step actually needs.** To produce the next number you need
the previous two and nothing else — not the whole sequence, not an array of
them. That observation is the entire solution.

**3. Decide what you are looping over.** One pass per number from 2 up to \`n\`,
carrying the last two as you go. \`n = 0\` and \`n = 1\` are before the loop starts,
so they are answered before it.

**4. Be careful with the assignment order.** Two variables that have to move
along together will destroy each other if you overwrite one before reading it.
Work the first two rounds by hand against your own code.

**5. Only then consider the recursive version** — and know why it is not this
one.

## The loop

\`\`\`java Fib.java @run-fib
public class Fib {

    static int fib(int n) {
        if (n == 0) return 0;
        if (n == 1) return 1;

        int a = 0;
        int b = 1;

        for (int i = 2; i <= n; i++) {
            int c = a + b;
            a = b;
            b = c;
        }

        return b;
    }

    public static void main(String[] args) {
        StringBuilder row = new StringBuilder();
        for (int n = 0; n <= 10; n++) row.append(n == 0 ? "" : " ").append(fib(n));
        System.out.println(row);
        System.out.println("fib(30) = " + fib(30));
        System.out.println("fib(46) = " + fib(46));
        System.out.println("fib(47) = " + fib(47) + "   <- an int cannot hold it");
    }
}
\`\`\`

\`\`\`output @run-fib
0 1 1 2 3 5 8 13 21 34 55
fib(30) = 832040
fib(46) = 1836311903
fib(47) = -1323752223   <- an int cannot hold it
\`\`\`

**\`a\` and \`b\` are a window sliding along the sequence**, and \`c\` is what makes
the slide safe. Written as \`a = b; b = a + b;\` the second line would use the
already-overwritten \`a\` and the answer would be wrong from the third number on —
the temporary is not a style choice, it is what keeps the two moves independent.

![The two-variable window sliding along the sequence](diagrams/fibonacci-number-notes-window.jpg)

**The two guards are the base cases**, and they are before the loop because the
loop starts at 2. For \`n = 1\` the loop body never runs and \`b\` is already the
answer — so the second guard could be dropped and \`return b\` would still be
right. It stays because "fib(0) is 0 and fib(1) is 1" is the definition, and
code that states the definition is easier to trust than code that relies on a
loop bound to state it.

**\`fib(47)\` is negative**, and that is not a bug in the loop — it is an \`int\`
holding a number bigger than two billion. The problem constrains \`n\` to 30 so it
never comes up, but knowing *why* it goes negative rather than wrong-but-positive
is the thing being tested when it does.

## The recursion, and why not

The definition translates directly:

\`\`\`java
static int fib(int n) {
    return n < 2 ? n : fib(n - 1) + fib(n - 2);
}
\`\`\`

Correct, and it recomputes \`fib(n - 2)\` twice, \`fib(n - 3)\` three times, and so
on down — roughly \`2ⁿ\` calls where the loop takes \`n\`. For \`n = 30\` that is
about a million calls against thirty additions. Memoising it fixes the time and
costs O(n) memory; the loop is the same answer with neither problem.

## Time — O(n)

One pass per number, and each pass is a single addition.

![One pass per number, so the work rises in step with n](diagrams/fibonacci-number-notes-time.jpg)

## Space — O(1)

Three \`int\`s, however large \`n\` is. Nothing is stored, which is the point of
carrying only the two values a step actually needs.

![Three ints whatever n is, so the memory line stays flat](diagrams/fibonacci-number-notes-space.jpg)

| | Cost | Why |
|---|---|---|
| Time | O(n) | one addition per number |
| Space | O(1) | three \`int\`s, no array |
| Recursive | O(2ⁿ) time | the same values recomputed all the way down |
`;export{e as default};