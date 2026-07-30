var e=`Add the digits of a number. If the answer has more than one digit, add its
digits too, and keep going until one digit is left. 38 becomes 3 + 8 = 11,
which becomes 1 + 1 = 2. That last digit has a name — it is the **digital
root** — and the loop that finds it is two of this topic's loops nested.

## How to approach it

**1. Do it by hand, three times.** 12345, then 999, then 7. The third one is the
important one: nothing happens, and the code has to agree that nothing should.

**2. Notice that the rule contains itself.** "Add the digits, and if that has
more than one digit, do it again." A rule that repeats itself until a condition
holds is a loop wrapped around whatever the rule was. So this is two loops, one
inside the other, and recognising that is most of the work.

**3. Write the inner one first, on its own.** Digit sum of a number. Get it
right for 12345 before the outer loop exists — a nested loop that is wrong is
twice as hard to read as a single one that is wrong.

**4. Say the outer condition in the question's own words.** *While the result
still has more than one digit.* Then translate: more than one digit means at
least ten. That is the whole condition, and writing it this way is why 7 and 0
need no special case.

**5. Check what the inner loop leaves behind.** It eats the number it is given.
The outer loop has to hand the next round something, and the only thing the next
round needs is the sum.

**6. Then read the three versions below in order.** The loop is the answer, the
recursion is the same answer said differently, and the formula is the follow-up
— produced in the other order it looks like something you memorised rather than
something you worked out.

If you are stuck on step 2 or 3, **Hints** in the bar walks the same route
without showing the code.

## Approach 1 — two loops, one inside the other

\`\`\`java AddDigits.java @run-add-digits-add-digits
static int addDigits(int num) {
    while (num >= 10) {
        int sum = 0;

        while (num > 0) {
            sum += num % 10;
            num /= 10;
        }

        num = sum;
    }
    return num;
}
\`\`\`

\`\`\`output @run-add-digits-add-digits
addDigits(0)                 -> 0
addDigits(9)                 -> 9
addDigits(38)                -> 2
addDigits(12345)             -> 6
addDigits(999999999)         -> 9
addDigits(Integer.MAX_VALUE) -> 1
\`\`\`

\`\`\`demo AddDigits.java
addDigits(0)
addDigits(9)
addDigits(38)
addDigits(12345)
addDigits(999999999)
addDigits(Integer.MAX_VALUE)
\`\`\`

The inner \`while\` is the digit loop and nothing else: take the last digit with
\`% 10\`, drop it with \`/ 10\`, stop when there is nothing left. The outer \`while\`
is the *repeat*, and its condition is the whole specification — \`num >= 10\`
means "still more than one digit", so a number that already is one digit never
enters either loop and comes straight back out. That is why 0 and 9 are correct
without a special case.

![The digit sum applied again and again until one digit is left](diagrams/add-digits-notes-reduce.jpg)

Two details worth having deliberately rather than by luck.

**\`sum\` is declared inside the outer loop.** It has to start at 0 for each
pass; hoisted out of the loop it would accumulate across passes and the answer
would be wrong for anything that needs a second round.

**The loop consumes \`num\` and then replaces it.** By the time the inner loop
ends \`num\` is 0, and \`num = sum\` is what makes the next pass possible. Nothing
is lost, because the digit sum is all the next pass needs.

## Approach 2 — the same rule, said as recursion

The outer loop exists because the rule repeats itself, and "the rule applies to
its own answer" is what recursion says out loud. One digit is the base case;
anything longer is the digit sum, handed back to the same method.

\`\`\`java AddDigitsRecursive.java @run-add-digits-add-digits-recursive
static int addDigits(int num) {
    if (num < 10) return num;

    int sum = 0;
    for (int x = num; x > 0; x /= 10) sum += x % 10;

    return addDigits(sum);
}
\`\`\`

\`\`\`output @run-add-digits-add-digits-recursive
addDigits(0)                 -> 0
addDigits(9)                 -> 9
addDigits(38)                -> 2
addDigits(12345)             -> 6
addDigits(999999999)         -> 9
addDigits(Integer.MAX_VALUE) -> 1
\`\`\`

\`\`\`demo AddDigitsRecursive.java
addDigits(0)
addDigits(9)
addDigits(38)
addDigits(12345)
addDigits(999999999)
addDigits(Integer.MAX_VALUE)
\`\`\`

It reads closer to the sentence in the problem, and it is the same work: the
outer \`while\` has become the call at the end. **The stack does not grow far** —
for an \`int\` this recurses at most twice, because the digit sum of the biggest
\`int\` is 46 and the digit sum of that is 10.

Note the \`for (int x = num; …)\` rather than consuming \`num\` itself. The
recursion needs nothing after the sum, but leaving the parameter alone is the
habit that stops a "why is \`num\` zero here" half an hour later.

## Approach 3 — the digital root, with no loop at all

The follow-up asks for it without the loop, and there is one, because
\`10 ≡ 1 (mod 9)\`: every power of ten leaves a remainder of 1 when divided by
nine, so a number and its digit sum always leave the *same* remainder. Repeating
the digit sum therefore lands on the number's remainder mod 9 — with 9 itself
standing in for a remainder of 0.

\`\`\`java AddDigitsFormula.java @run-add-digits-add-digits-formula
static int addDigits(int num) {
    return num == 0 ? 0 : 1 + (num - 1) % 9;
}
\`\`\`

\`\`\`output @run-add-digits-add-digits-formula
addDigits(0)                 -> 0
addDigits(9)                 -> 9
addDigits(38)                -> 2
addDigits(12345)             -> 6
addDigits(999999999)         -> 9
addDigits(Integer.MAX_VALUE) -> 1
\`\`\`

\`\`\`demo AddDigitsFormula.java
addDigits(0)
addDigits(9)
addDigits(38)
addDigits(12345)
addDigits(999999999)
addDigits(Integer.MAX_VALUE)
\`\`\`

**\`1 + (num - 1) % 9\` rather than \`num % 9\`** because the remainder of 0 has to
come back as 9: for 9, 18 and 27 the digital root is 9 and \`num % 9\` says 0.
Shifting down by one, taking the remainder and shifting back is the standard way
of writing "1 to 9 instead of 0 to 8", and the \`num == 0\` guard is there because
0 is the one number whose answer really is 0.

Know it, but write the loop first unless the follow-up is asked. The loop is
what shows you can turn the rule into code; the formula is what shows you have
seen this problem before.

## What the three cost

**Time is the yellow line, memory the green one.** All three answer every input
identically — what changes is whether the digits get read at all.

![Time and memory for all three versions on one pair of axes](diagrams/add-digits-notes-cost.jpg)

| Approach | Time | Space | |
|---|---|---|---|
| 1 — nested loops | O(log n) | O(1) | **write this one** |
| 2 — recursion | O(log n) | O(1) — two frames at most | the same thing, said in the problem's words |
| 3 — digital root | O(1) | O(1) | the follow-up, and one line |

The first pass over the digits is the whole cost of versions 1 and 2: a number
has about \`log10\` of it digits, and the passes after the first are over a number
no larger than 90 whatever you started from. For an \`int\` that is three rounds
at the outside — 2147483647, then 46, then 10, then 1.
`;export{e as default};