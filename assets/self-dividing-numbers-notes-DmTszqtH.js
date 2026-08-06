var e=`A number is self-dividing when every digit it contains divides it. The definition
is the algorithm, and the whole problem is in one digit: a zero, which divides
nothing and will throw if you let it reach the \`%\`.

## 1. The problem

Given two integers \`left\` and \`right\`, return every self-dividing number in the
range \`left\` to \`right\`, both ends included.

- **In** — \`left\` and \`right\`, both \`int\`, with \`1 <= left <= right <= 10⁴\`.
- **Out** — a \`List<Integer>\`, in increasing order.
- **Self-dividing** — \`num % d == 0\` for every digit \`d\` of \`num\`.

\`\`\`text
left = 1, right = 22

1 2 3 4 5 6 7 8 9 11 12 15 22

128 is self-dividing:  128 % 1 = 0,  128 % 2 = 0,  128 % 8 = 0
102 is not:            it contains a 0
\`\`\`

Three facts about the input decide the page.

**A zero digit is not a failed test — it is an illegal one.** \`num % 0\` does not
return something unhelpful, it throws \`ArithmeticException\`. So the check for it
has to happen *before* the division, not as a case of it, and that ordering is
the one line most first attempts get wrong.

**The digits are tested against the whole number, never against what is left of
it.** For 128, the third test is \`128 % 8\`, not \`1 % 8\`. The loop that peels
digits off shrinks its own copy, and reaching for that copy in the test is the
second common mistake — it is silent, and it gives wrong answers rather than an
exception.

**\`left\` starts at 1, so there is no zero to defend against** at the top level.
Every candidate has at least one digit and that digit is at least 1, so 1 through
9 are all self-dividing by inspection.

## 2. The brute force

Turn the number into text, walk the characters, convert each one back.

\`\`\`java SelfDividingText.java @run-self-dividing-numbers-self-dividing-text
static long built = 0;

static boolean isSelfDividing(int num) {

    String digits = String.valueOf(num);
    built += digits.length();

    for (int i = 0; i < digits.length(); i++) {

        int digit = digits.charAt(i) - '0';

        if (digit == 0) {
            return false;
        }

        if (num % digit != 0) {
            return false;
        }
    }

    return true;
}

static List<Integer> selfDividingNumbers(int left, int right) {

    List<Integer> ans = new ArrayList<>();

    for (int i = left; i <= right; i++) {
        if (isSelfDividing(i)) {
            ans.add(i);
        }
    }

    return ans;
}

static long charactersBuilt(int left, int right) {
    built = 0;
    selfDividingNumbers(left, right);
    return built;
}
\`\`\`

\`\`\`output @run-self-dividing-numbers-self-dividing-text
selfDividingNumbers(1, 22)  -> [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 15, 22]
selfDividingNumbers(47, 85) -> [48, 55, 66, 77]
isSelfDividing(128)         -> true
isSelfDividing(102)         -> false
charactersBuilt(1, 22)      -> 35
charactersBuilt(1, 10000)   -> 38894
\`\`\`

\`\`\`demo SelfDividingText.java
selfDividingNumbers(1, 22)
selfDividingNumbers(47, 85)
isSelfDividing(128)
isSelfDividing(102)
charactersBuilt(1, 22)
charactersBuilt(1, 10000)
\`\`\`

### The code, line by line

- \`String digits = String.valueOf(num);\` — **the allocation, and it is the only
  reason this version exists as a separate page.** One \`String\` object and one
  \`char[]\` behind it, per candidate, thrown away a few lines later.
- \`built += digits.length();\` — not part of the answer. It totals the characters
  of text this approach creates, so the cost is a number in the output panel
  rather than a claim in the prose.
- \`digits.charAt(i) - '0'\` — the conversion back. \`'8'\` is the character whose
  code is 56 and \`'0'\` is 48, so subtracting one from the other gives 8. It is
  correct and it is round-tripping a number through text to get the number back.
- \`if (digit == 0) { return false; }\` — **first, and that order is the whole
  guard.** Swap these two \`if\`s and \`num % 0\` runs on the first candidate
  containing a zero, which is 10.
- \`if (num % digit != 0) { return false; }\` — \`num\`, the original. \`digits\` was
  built once from \`num\` and never changes, so there is nothing here that could
  drift — which is exactly why this version hides the mistake the arithmetic one
  can make.
- \`return true;\` — every digit was tested and none of them objected. An empty
  loop cannot happen: \`left\` is at least 1, so there is always a digit.
- \`selfDividingNumbers\` is the shell and it never changes on this page. One pass
  over the range, one test per candidate, keep what passes.

## 3. Dry run of the brute force

\`isSelfDividing(128)\`. The string is \`"128"\` and the loop reads it left to right.

| i | char | digit | test | result |
|---|---|---|---|---|
| 0 | \`'1'\` | 1 | \`128 % 1\` is 0 | keep going |
| 1 | \`'2'\` | 2 | \`128 % 2\` is 0 | keep going |
| 2 | \`'8'\` | 8 | \`128 % 8\` is 0 | keep going |
| end | — | — | — | **true** |

Now \`isSelfDividing(102)\`, which is the one that matters.

| i | char | digit | test | result |
|---|---|---|---|---|
| 0 | \`'1'\` | 1 | \`102 % 1\` is 0 | keep going |
| 1 | \`'0'\` | 0 | **not reached** | \`return false\` |
| 2 | — | — | — | never runs |

**The middle row is the whole problem, and it is only harmless because of where
the guard sits.** With the two \`if\`s the other way round that row reads
\`102 % 0\`, and the method does not return false — it throws.

And \`isSelfDividing(16)\`, which fails the ordinary way:

| i | char | digit | test | result |
|---|---|---|---|---|
| 0 | \`'1'\` | 1 | \`16 % 1\` is 0 | keep going |
| 1 | \`'6'\` | 6 | \`16 % 6\` is **4** | \`return false\` |
| end | — | — | — | **false** |

15 passes and 16 does not, and the two sitting next to each other is a fair
reminder that there is no pattern here to spot — only the test.

## 4. Why it is not enough

Time is **O((right − left) · d)** where \`d\` is the number of digits — at most
four here, so about forty thousand \`%\` operations across the whole range. That is
nothing, and this version passes.

Which is the trap. Read \`charactersBuilt(1, 10000)\` in the output above:
**38894 characters of text, across ten thousand \`String\` objects**, all of them
garbage within microseconds. None of that work was asked for. The digits were
already inside the number; \`String.valueOf\` writes them out as characters and
\`charAt(i) - '0'\` reads them straight back, so the two lines undo each other and
the allocation is what is left.

The arithmetic that gets the same digits is two operators:

\`\`\`text
128 % 10 = 8      128 / 10 = 12
 12 % 10 = 2       12 / 10 = 1
  1 % 10 = 1        1 / 10 = 0    ← the loop's own stop condition
\`\`\`

**Right to left instead of left to right, and it does not matter here**, because
the question asks about every digit and not about their order. That is the fact
that makes this a free swap rather than a rewrite.

It also changes what the follow-up looks like. Asked to run this to 10⁹ instead
of 10⁴, the string version has a billion allocations to answer for before anybody
gets to the interesting point — which is that **a self-dividing number can never
contain a zero, so eight of every nine candidates in the range are not worth
testing at all**, and the right move is to build candidates from the digits 1–9
rather than filter them out of all ten.

## 5. The plan, in pseudocode

\`\`\`pseudo
isSelfDividing(num):

    temp <- num                   the copy that gets destroyed

    while temp > 0:

        digit <- temp mod 10      the last digit
        if digit = 0:             illegal, and it must be caught here
            return false

        if num mod digit != 0:    num, not temp
            return false

        temp <- temp / 10         drop the digit just tested

    return true
\`\`\`

Two variables and it is worth naming what each is for. **\`temp\` is the reading
head** — it shrinks by one digit per turn and its reaching zero is what ends the
loop. **\`num\` is the subject** — it never changes, because every test is about
the original number.

Confusing them is the bug this problem is really about. \`temp % digit\` compiles,
runs, and quietly reports that 128 is not self-dividing.

## 6. The digit loop

\`\`\`java SelfDividing.java @run-self-dividing-numbers-self-dividing
static List<Integer> selfDividingNumbers(int left, int right) {

    List<Integer> ans = new ArrayList<>();

    for (int i = left; i <= right; i++) {
        if (isSelfDividing(i)) {
            ans.add(i);
        }
    }

    return ans;
}

static boolean isSelfDividing(int num) {

    int temp = num;

    while (temp > 0) {

        int digit = temp % 10;

        // Digit should not be 0
        if (digit == 0) {
            return false;
        }

        // Number should be divisible by the digit
        if (num % digit != 0) {
            return false;
        }

        temp = temp / 10;
    }

    return true;
}

static boolean wrongSubject(int num) {

    int temp = num;

    while (temp > 0) {

        int digit = temp % 10;
        if (digit == 0) return false;
        if (temp % digit != 0) return false;

        temp = temp / 10;
    }

    return true;
}
\`\`\`

\`\`\`output @run-self-dividing-numbers-self-dividing
selfDividingNumbers(1, 22)  -> [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 15, 22]
selfDividingNumbers(47, 85) -> [48, 55, 66, 77]
isSelfDividing(128)         -> true
isSelfDividing(102)         -> false
isSelfDividing(16)          -> false
isSelfDividing(31)          -> false
wrongSubject(128)           -> true
wrongSubject(31)            -> true
\`\`\`

\`\`\`demo SelfDividing.java
selfDividingNumbers(1, 22)
selfDividingNumbers(47, 85)
isSelfDividing(128)
isSelfDividing(102)
isSelfDividing(16)
isSelfDividing(31)
wrongSubject(128)
wrongSubject(31)
\`\`\`

### The code, line by line

- \`int temp = num;\` — **the copy, and making it is the point.** The loop is going
  to destroy whatever it counts down, and the thing being tested must survive
  that. One variable doing both jobs is the mistake \`wrongSubject\` below is here
  to show.
- \`while (temp > 0)\` — the digits run out exactly when \`temp\` reaches 0, because
  integer division floors and a one-digit number divided by ten is zero. No digit
  count is needed and none is kept.
- \`int digit = temp % 10;\` — the last digit of what is left. Right to left, which
  the problem does not care about.
- \`if (digit == 0) { return false; }\` — **the guard, and it must come before the
  next line.** This is not an optimisation and it is not stylistic: \`num % 0\`
  throws \`ArithmeticException\`, and the first input that reaches it is 10.
- \`if (num % digit != 0) { return false; }\` — **\`num\`, not \`temp\`.** The
  definition is about the whole number, so the whole number is what gets divided.
  Written with \`temp\` it tests 128, then 12, then 1 — three different questions,
  none of them the one asked.
- \`temp = temp / 10;\` — drop the digit just tested. This is the only line that
  moves the loop forward, and it sits *after* both tests, so an early \`return\`
  leaves it unrun and costs nothing.
- \`return true;\` — the loop ended the only way it can end without returning:
  every digit was tested and every one divided.
- \`wrongSubject\` is not an answer. It is the same method with \`num\` swapped for
  \`temp\` in one place, printed so the failure is on screen rather than described.

## 7. Dry run of the fast version

\`isSelfDividing(128)\`. One row per turn, and watch the two columns stay apart.

| turn | temp | digit | \`num % digit\` | verdict | temp after |
|---|---|---|---|---|---|
| 1 | 128 | 8 | \`128 % 8\` = 0 | ok | 12 |
| 2 | 12 | 2 | \`128 % 2\` = 0 | ok | 1 |
| 3 | 1 | 1 | \`128 % 1\` = 0 | ok | 0 |
| end | 0 | — | — | **true** | — |

**The \`num\` in column four never moves.** That is the whole discipline of this
method in one column.

![The digits of 128 peeled off one at a time, each tested against 128 itself](diagrams/self-dividing-numbers-notes-peel.jpg)

Green at the top is \`num\`, and the dotted arrows are the whole of what it does —
it is the subject of all three tests and it never moves. Each blue box is one turn
of the loop: the copy as it stands, the digit that came off it, and the test that
digit gets. **Every test in the third line reads 128**, not the number in the
first line of its own box.

Run the same table with \`temp\` as the subject, which is what \`wrongSubject\` does:

| turn | temp | digit | \`temp % digit\` | verdict |
|---|---|---|---|---|
| 1 | 128 | 8 | \`128 % 8\` = 0 | ok |
| 2 | 12 | 2 | \`12 % 2\` = 0 | ok |
| 3 | 1 | 1 | \`1 % 1\` = 0 | ok |
| end | — | — | — | **true**, and by luck |

**It agrees on 128**, which is why this bug survives a first test. Every number
whose digits all divide it also has that property digit by digit often enough
that a hand-picked example proves nothing.

Read \`wrongSubject(31)\` against \`isSelfDividing(31)\` in the output above. 31 is
**not** self-dividing: \`31 % 3\` is 1. But the wrong version has already thrown
the 1 away by then, so on turn two it asks \`3 % 3\`, gets 0, and reports true. The
two methods part company on the first input where the discarded digits mattered —
which is most of them, and none of the obvious ones.

Now \`isSelfDividing(102)\`, where the guard does its work:

| turn | temp | digit | what happens |
|---|---|---|---|
| 1 | 102 | 2 | \`102 % 2\` is 0, temp → 10 |
| 2 | 10 | **0** | guard fires, \`return false\` |

Without the guard, turn 2 evaluates \`102 % 0\` and the submission comes back as a
runtime error rather than a wrong answer. Both are failures; only one of them
tells you where to look.

## 8. Key takeaways

- **Check the zero digit before you divide by it.** \`num % 0\` throws
  \`ArithmeticException\` — it is not a test that returns false. The first input
  that reaches it is 10, so it is not an edge case you can hope to miss.
- **Divide the original, not the copy.** \`num % digit\`, never \`temp % digit\`. The
  wrong one agrees on plenty of inputs, including 128, and disagrees on the ones
  the judge picked.
- **\`% 10\` and \`/ 10\` are the digits; a \`String\` is the digits written out and
  read back.** The text version costs an object per candidate to learn what the
  number already knew.
- **The order is right to left, and this problem does not care.** Every digit is
  tested against the same number, so nothing depends on which one comes first.
- **\`while (temp > 0)\` needs no digit count.** Integer division floors, so a
  one-digit number divided by ten is zero and the loop ends on its own.
- **\`temp = temp / 10\` goes last.** Both tests can return early, and a
  short-circuit that skips the advance costs nothing precisely because there is
  nothing after it.
- **O((right − left) · d) time, O(1) space beyond the answer** — about forty
  thousand \`%\` operations over the whole range, which is why either version
  passes.
- **The follow-up is the range, not the test.** Asked for 10⁹, stop filtering and
  start generating: a self-dividing number contains no zero, so building
  candidates out of the digits 1–9 leaves 9ᵈ of them instead of 10ᵈ, and each one
  is born already past the guard.
`;export{e as default};