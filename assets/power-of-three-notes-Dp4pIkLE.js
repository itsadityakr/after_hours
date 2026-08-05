var e=`1, 3, 9, 27, 81 — one, tripled, as many times as you like. It is
[Power of Two](problem:power-of-two) with one digit changed, and it is on the
sheet separately because the trick that makes the power-of-two version famous
does not exist here.

## 1. The problem

Given an integer \`n\`, return \`true\` if it is a power of three.

- **In** — \`n\`, an \`int\`, and \`−2³¹ <= n <= 2³¹ − 1\`.
- **Out** — \`boolean\`.
- **Power of three** — \`n == 3ˣ\` for some integer \`x >= 0\`.

The same four inputs decide this as decided part two, and three of them are about
the sign:

| n | answer | why |
|---|---|---|
| 1 | \`true\` | 3⁰ |
| 0 | \`false\` | nothing tripled reaches zero |
| −27 | \`false\` | powers of three are positive |
| 45 | \`false\` | 3 × 3 × 5 — it has threes in it, and something else too |

**There are only 20 powers of three in an \`int\`**, ending at 3¹⁹ = 1162261467.
That is a small set, and its smallness is the door to two other solutions.

## 2. The plan, in pseudocode

\`\`\`pseudo
isPowerOfThree(n):

    if n <= 0:
        return false              zero loops forever, negatives are excluded

    while n is divisible by 3:
        n <- n / 3                take out one factor of three

    return n = 1                  nothing else was in there
\`\`\`

Identical in shape to the power-of-two plan, and identical for a reason: **"is
this a power of \`k\`" is always "divide out every \`k\` and see whether 1 is what
is left".** The base is the only thing that changes.

## 3. The brute force

\`\`\`java PowerOfThree.java @run-power-of-three-power-of-three
static boolean isPowerOfThree(int n) {

    if (n <= 0) {
        return false;
    }

    while (n % 3 == 0) {
        n = n / 3;
    }

    return n == 1;
}
\`\`\`

\`\`\`output @run-power-of-three-power-of-three
isPowerOfThree(1)          -> true
isPowerOfThree(3)          -> true
isPowerOfThree(27)         -> true
isPowerOfThree(1162261467) -> true
isPowerOfThree(45)         -> false
isPowerOfThree(0)          -> false
isPowerOfThree(-27)        -> false
\`\`\`

\`\`\`demo PowerOfThree.java
isPowerOfThree(1)
isPowerOfThree(3)
isPowerOfThree(27)
isPowerOfThree(1162261467)
isPowerOfThree(45)
isPowerOfThree(0)
isPowerOfThree(-27)
\`\`\`

### The code, line by line

- \`if (n <= 0) return false;\` — the same two jobs as before. **Zero would loop
  forever**, because \`0 % 3\` is 0 and \`0 / 3\` is 0, so the condition stays true
  and nothing changes. **Negatives** are excluded by the definition, and without
  the guard they would end the loop on −1 and return \`false\` by accident rather
  than on purpose.
- \`while (n % 3 == 0)\` — strip out one factor of three per turn.
- \`n = n / 3;\` — exact, because the condition guarantees divisibility.
- \`return n == 1;\` — the leftover test. Everything divisible by three has been
  removed, so a survivor of 1 means there was nothing else.

## 4. Dry run of the brute force

\`n = 27\`, a power of three, and \`n = 45\`, which is not — and 45 is the
interesting one, because it *does* contain threes.

| turn | n | n % 3 | divisible? | n after |
|---|---|---|---|---|
| 1 | 27 | 0 | yes | 9 |
| 2 | 9 | 0 | yes | 3 |
| 3 | 3 | 0 | yes | 1 |
| end | 1 | 1 | no | \`1 == 1\` → **true** |

| turn | n | n % 3 | divisible? | n after |
|---|---|---|---|---|
| 1 | 45 | 0 | yes | 15 |
| 2 | 15 | 0 | yes | 5 |
| end | 5 | 2 | no | \`5 == 1\` is false → **false** |

![4. Dry run of the brute force — diagram](diagrams/power-of-three-notes-mm-1.jpg)

**45 divides twice and still fails.** Counting how many times the loop ran would
have said "twice, so it must be 3²" — which is wrong. The leftover is the answer,
not the count, and 45 is the input that proves it.

\`n = 1\` runs the loop zero times and returns \`true\`, which is correct: 3⁰ is 1.

## 5. Why it is not enough

It is enough — **O(log₃ n) time, O(1) space**, and at most 20 turns for any
\`int\`. Nothing here is slow.

The reason this problem exists separately is what you *cannot* do. Power of two
has a famous one-line answer, because in binary a power of two has exactly one
bit set and \`n & (n - 1)\` clears the lowest one. **There is no bit pattern for
base three.** Computers count in twos, so three is nothing special to them and
that whole route is closed.

What is open is the smallness of the set. There are only 20 powers of three in an
\`int\`, and the largest of them is 1162261467. Every other one divides it exactly
— and because **3 is prime**, nothing else does. That gives you a single \`%\`,
with no loop at all.

The primeness is the whole argument, and it is worth being able to say why: a
divisor of 3¹⁹ can only be built from the prime factors of 3¹⁹, and there is only
one of those. Try the same move on a base that is not prime and it collapses —
6⁴ is divisible by 8 and by 9, and neither is a power of six.

**One route to avoid: logarithms.** \`Math.log(n) / Math.log(3)\` and asking
whether the result is a whole number looks elegant and is a floating-point trap.
The values are not exact, so the test needs a tolerance, and choosing that
tolerance badly gets 243 or 19683 wrong. Integer arithmetic has no such problem,
which is the real lesson here.

## 6. Key takeaways

- **"Is it a power of \`k\`" is always "divide out every \`k\` and check for 1".**
  The base is the only thing that changes between this and
  [Power of Two](problem:power-of-two).
- **The leftover is the answer, not the count of divisions.** 45 divides by three
  twice and is still not a power of three.
- **Guard \`n <= 0\`.** Zero spins forever because \`0 / 3\` is 0; negatives are
  excluded by definition.
- **1 is a power of three.** The loop runs zero times and the leftover test
  handles it.
- **There is no bit trick here.** Machines count in twos; base three has no
  pattern to exploit, which is exactly why this problem is asked separately.
- **3 is prime, and only 20 powers of it fit an \`int\`** — so every one divides
  1162261467 and nothing else does. That is a one-line answer.
- **Do not reach for logarithms.** Floating point needs a tolerance and the
  tolerance is where the wrong answers come from.
`;export{e as default};