var e=`A power of two is 1, 2, 4, 8, 16 — one, doubled, as many times as you like. Is
\`n\` one of them? The definition answers it in four lines, and four of the inputs
that break solutions are about the sign rather than the doubling.

## 1. The problem

Given an integer \`n\`, return \`true\` if it is a power of two.

- **In** — \`n\`, an \`int\`, and \`−2³¹ <= n <= 2³¹ − 1\`.
- **Out** — \`boolean\`.
- **Power of two** — \`n == 2ˣ\` for some integer \`x >= 0\`.

**The range includes negatives and zero, and that is the whole trap.** Write
these four down before writing any code:

| n | answer | why |
|---|---|---|
| 1 | \`true\` | 2⁰ — the one people forget is included |
| 0 | \`false\` | nothing doubled ever reaches zero |
| −16 | \`false\` | a power of two is positive by definition |
| \`Integer.MIN_VALUE\` | \`false\` | the most negative \`int\`, and it will fool a careless test |

There are only 31 powers of two in an \`int\`, from 1 up to 2³⁰ = 1073741824 —
2³¹ is already past \`Integer.MAX_VALUE\`. That is a small enough set to be worth
remembering.

## 2. The brute force

Take the definition literally and undo the doubling: while the number is even,
halve it, then look at what is left.

\`\`\`java PowerOfTwo.java @run-power-of-two-power-of-two
static boolean isPowerOfTwo(int n) {

    if (n <= 0) {
        return false;
    }

    while (n % 2 == 0) {
        n = n / 2;
    }

    return n == 1;
}
\`\`\`

\`\`\`output @run-power-of-two-power-of-two
isPowerOfTwo(1)                 -> true
isPowerOfTwo(2)                 -> true
isPowerOfTwo(16)                -> true
isPowerOfTwo(1073741824)        -> true
isPowerOfTwo(6)                 -> false
isPowerOfTwo(0)                 -> false
isPowerOfTwo(-16)               -> false
isPowerOfTwo(Integer.MIN_VALUE) -> false
\`\`\`

\`\`\`demo PowerOfTwo.java
isPowerOfTwo(1)
isPowerOfTwo(2)
isPowerOfTwo(16)
isPowerOfTwo(1073741824)
isPowerOfTwo(6)
isPowerOfTwo(0)
isPowerOfTwo(-16)
isPowerOfTwo(Integer.MIN_VALUE)
\`\`\`

### The code, line by line

- \`if (n <= 0) return false;\` — **the guard is correctness, not tidying**, and it
  is doing two separate jobs. **Zero would loop forever**: \`0 % 2\` is 0 and
  \`0 / 2\` is 0, so the condition stays true and \`n\` never changes. **A negative
  number** would end the loop on −1 rather than 1 and come back \`false\` — the
  right answer, but by where the loop happened to stop rather than by anything
  you said. Rejecting both up front is the version you can defend.
- \`while (n % 2 == 0)\` — "while it is still even". Each turn removes one factor
  of two, so the loop strips the number down to its odd part.
- \`n = n / 2;\` — the halving. Exact, because the condition guarantees \`n\` is even.
- \`return n == 1;\` — **the question the whole method is asking.** If dividing out
  every factor of two leaves 1, there was nothing else in the number and it was a
  pure power of two. Anything else left over means it had another factor.

## 3. Dry run of the brute force

\`n = 16\`, which is a power of two, and \`n = 6\`, which is not. Both run through
the same loop.

| turn | n | n % 2 | even? | n after |
|---|---|---|---|---|
| — | 16 | 0 | yes | — |
| 1 | 16 | 0 | yes | 8 |
| 2 | 8 | 0 | yes | 4 |
| 3 | 4 | 0 | yes | 2 |
| 4 | 2 | 0 | yes | 1 |
| end | 1 | **1** | no | loop stops, \`1 == 1\` → **true** |

| turn | n | n % 2 | even? | n after |
|---|---|---|---|---|
| 1 | 6 | 0 | yes | 3 |
| end | 3 | **1** | no | loop stops, \`3 == 1\` → **false** |

The two chains side by side — green is a power of two all the way down, amber is
the odd factor that gives 6 away:

![3. Dry run of the brute force — diagram](diagrams/power-of-two-notes-mm-1.jpg)

**6 stops at 3, and 3 is the answer.** Six *does* have a factor of two in it —
that is why the loop ran once — but it also has a 3, and the leftover is what
tells them apart. That is why the last line asks \`n == 1\` rather than counting
the halvings.

Now the input that shows why the guard exists. Delete \`if (n <= 0)\` and run
\`n = 0\`:

| turn | n | n % 2 | even? | n after |
|---|---|---|---|---|
| 1 | 0 | 0 | yes | 0 |
| 2 | 0 | 0 | yes | 0 |
| … | 0 | 0 | yes | 0 — **forever** |

\`0 / 2\` is 0, so the number never changes and the condition never becomes false.
**It does not return a wrong answer; it does not return at all.**

## 4. Why it is not enough

It is correct and it is fast — the loop runs once per factor of two, so at most
31 turns for an \`int\`. **O(log n) time, O(1) space**, and it answers instantly on
every input.

So this is not about speed. The reason the problem is asked is that a power of
two has a property the loop never looks at, and it is visible the moment you stop
thinking in decimal:

| n | binary |
|---|---|
| 1 | \`1\` |
| 2 | \`10\` |
| 4 | \`100\` |
| 8 | \`1000\` |
| 16 | \`10000\` |
| 12 | \`1100\` — not a power of two |

**Exactly one bit is set.** That is not a pattern about zeros; it is a statement
about how many ones there are, and it turns the whole method into a single test
with no loop at all.

Two routes from there, and both are worth finding for yourself. One asks the
count directly. The other uses what subtracting 1 does to a binary number —
take 16 (\`10000\`) and 12 (\`1100\`), subtract one from each, and look at what
happens to the bits above the lowest set one. Combining \`n\` with \`n - 1\` then
separates the two cases in one expression.

Whichever you reach, **the \`n > 0\` guard survives into it unchanged** — and on
the bit version it matters even more, because \`Integer.MIN_VALUE\` genuinely does
have exactly one bit set.

## 5. Key takeaways

- **Write the four sign cases down first:** 1, 0, −16, \`Integer.MIN_VALUE\`.
  Three of the four are about the sign, and they are where wrong submissions come
  from.
- **\`n <= 0\` is correctness, not neatness.** Zero makes this loop run forever,
  because \`0 / 2\` is 0.
- **Dividing out every factor of two and asking what is left** is the definition
  turned into code. Leftover 1 means yes; anything else means it had another
  factor.
- **1 is a power of two** — 2⁰. It is the answer people delete by accident when
  tightening the guard.
- **O(log n), at most 31 turns for an \`int\`** — there are only 31 powers of two
  in the range, ending at 1073741824.
- **In binary a power of two has exactly one bit set.** That is the observation
  the whole problem exists to test, and it removes the loop entirely.
`;export{e as default};