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

**5. Then walk the four versions below in order.** They are the same problem
answered four times, each one fixing what the last one wasted — and the walk
from the first to the last is the answer to "how would you improve it", which is
the follow-up this problem exists to ask.

## Approach 1 — the definition, written directly

The words of the problem, translated one for one. It is worth writing once
because it is *obviously* correct, and because what is wrong with it is not
obvious until you count the calls.

\`\`\`java FibNaive.java @run-fibonacci-number-fib-naive
static int calls = 0;

static int fib(int n) {
    calls++;
    return n < 2 ? n : fib(n - 1) + fib(n - 2);
}

static int callsFor(int n) {
    calls = 0;
    fib(n);
    return calls;
}
\`\`\`

\`\`\`output @run-fibonacci-number-fib-naive
fib(10)      -> 55
callsFor(10) -> 177
callsFor(20) -> 21891
callsFor(30) -> 2692537
callsFor(35) -> 29860703
\`\`\`

\`\`\`demo FibNaive.java
fib(10)
callsFor(10)
callsFor(20)
callsFor(30)
callsFor(35)
\`\`\`

**The cost is in what it forgets.** \`fib(5)\` asks for \`fib(4)\` and \`fib(3)\`; that
\`fib(4)\` asks for \`fib(3)\` all over again, and neither of them knows the other
exists. The count roughly doubles for every 1 you add to \`n\` — that is
**O(2ⁿ)** — while the answer itself only ever needed \`n\` additions.

Space is **O(n)**, and it is the call stack rather than anything you allocated:
the deepest chain of unfinished calls is \`n\` frames.

## Approach 2 — remember what you have already worked out

The recursion is not the problem. Repeating it is. Keep an array of answers
already computed, and the tree collapses to a line.

\`\`\`java FibMemo.java @run-fibonacci-number-fib-memo
static int calls = 0;

static int fib(int n) {
    return fib(n, new int[n + 1]);
}

static int fib(int n, int[] seen) {
    calls++;
    if (n < 2) return n;
    if (seen[n] != 0) return seen[n];

    return seen[n] = fib(n - 1, seen) + fib(n - 2, seen);
}

static int callsFor(int n) {
    calls = 0;
    fib(n);
    return calls;
}
\`\`\`

\`\`\`output @run-fibonacci-number-fib-memo
fib(10)      -> 55
callsFor(10) -> 19
callsFor(20) -> 39
callsFor(30) -> 59
callsFor(35) -> 69
\`\`\`

\`\`\`demo FibMemo.java
fib(10)
callsFor(10)
callsFor(20)
callsFor(30)
callsFor(35)
\`\`\`

Put the two call counts side by side at \`n = 35\`: tens of millions against a few
dozen. Same recursion, same base cases, one array — which is the whole of what
memoisation is, and this is the smallest honest example of it on the sheet.

**The one-argument \`fib\` is the method the problem asked for**, and the cache is
an implementation detail it hides. An interviewer asking for \`fib(int n)\` should
get \`fib(int n)\`.

**Zero is doing double duty as "not computed yet"**, and it is safe here only
because nothing cached is ever 0: \`seen\` is written for \`n >= 2\`, and every
Fibonacci number from there up is at least 1. Reach for \`-1\` and an explicit fill
the moment a problem's answers can legitimately be zero.

**\`return seen[n] = …\` stores and returns in one line.** An assignment in Java is
an expression whose value is what was assigned, so this caches and answers
without naming a temporary.

## Approach 3 — fill a table forwards

Turn the recursion round. Instead of asking downwards from \`n\` and remembering,
start at the bottom and build up — same array, no stack at all.

\`\`\`java FibTable.java @run-fibonacci-number-fib-table
static int fib(int n) {
    if (n < 2) return n;

    int[] table = new int[n + 1];
    table[1] = 1;

    for (int i = 2; i <= n; i++)
        table[i] = table[i - 1] + table[i - 2];

    return table[n];
}
\`\`\`

\`\`\`output @run-fibonacci-number-fib-table
fib(10) -> 55
fib(30) -> 832040
fib(46) -> 1836311903
\`\`\`

\`\`\`demo FibTable.java
fib(10)
fib(30)
fib(46)
\`\`\`

\`table[0]\` is left at 0 because a fresh \`int[]\` is already zeros, and \`table[1]\`
is the one value that has to be planted. Every entry after that is read from the
two behind it, which is the definition again — written forwards.

This is **O(n)** time and **O(n)** space, and it is where most people stop. Look
at the loop body once more before you do: it only ever touches \`i - 1\` and
\`i - 2\`, so the other \`n - 2\` entries of that array are being kept for nothing.

## Approach 4 — carry two numbers and throw the rest away

\`\`\`java Fib.java @run-fibonacci-number-fib
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
\`\`\`

\`\`\`output @run-fibonacci-number-fib
fib(0)  -> 0
fib(1)  -> 1
fib(10) -> 55
fib(30) -> 832040
fib(46) -> 1836311903
fib(47) -> -1323752223
\`\`\`

\`\`\`demo Fib.java
fib(0)
fib(1)
fib(10)
fib(30)
fib(46)
fib(47)
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

**\`fib(47)\` comes back negative**, and that is not a bug in the loop — it is an
\`int\` holding a number bigger than two billion. The problem constrains \`n\` to 30
so it never comes up, but knowing *why* it goes negative rather than
wrong-but-positive is the thing being tested when it does.

## What the four cost

One picture for all of them: **time is the yellow line, memory the green one.**

![Time and memory for all four versions on one pair of axes](diagrams/fibonacci-number-notes-cost.jpg)

| Approach | Time | Space | |
|---|---|---|---|
| 1 — plain recursion | O(2ⁿ) | O(n) stack | states the definition and nothing else |
| 2 — memoised | O(n) | O(n) + stack | the fix that keeps the recursion |
| 3 — table, filled forwards | O(n) | O(n) | no stack, and an array you do not need |
| 4 — two variables | O(n) | O(1) | **write this one** |

The middle two are the same speed as the last one and pay for it in memory. Only
the first is slow, and it is slow in the way that matters — not by a constant,
but by a shape: at \`n = 35\` it is tens of millions of calls against thirty-four
additions.

Write the fourth. Say the first, so it is clear you can see the definition; say
what is wrong with it; then jump to the fourth and explain that the array in
between was only ever holding two useful numbers. That walk is worth more than
arriving at the answer with nothing to say about it.
`;export{e as default};