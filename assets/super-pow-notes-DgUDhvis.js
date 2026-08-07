var e=`The exponent arrives as an array of digits because it does not fit in anything —
two thousand of them, which is a number with more digits than the universe has
atoms. So there is no exponent to count down and no power to compute. The whole
problem is finding a way to read the digits one at a time and never build the
number at all.

## 1. The problem

Compute \`a\` raised to the power \`b\`, modulo 1337, where \`b\` is given as an array
of its decimal digits.

- **In** — \`a\`, an \`int\` with \`1 <= a <= 2³¹ − 1\`; \`b\`, an \`int[]\` of digits, most
  significant first, \`1 <= b.length <= 2000\` and no leading zeros.
- **Out** — \`a^b mod 1337\`, as an \`int\`.

\`\`\`text
a = 2,    b = [3]              ->  8       2³ = 8
a = 2,    b = [1, 0]           ->  1024    2¹⁰
a = 2,    b = [1, 1]           ->  711     2¹¹ = 2048, and 2048 − 1337 = 711
a = 1,    b = [4,3,3,8,5,2]    ->  1
a = 1337, b = [9, 9]           ->  0       1337 is the modulus itself
\`\`\`

Three facts about that statement do all the work later.

**The exponent cannot be held.** A \`long\` stops at nineteen digits; \`b\` can have
two thousand. Any solution whose first move is "turn \`b\` into a number" is wrong
before it starts, and — worse — it is wrong *silently*, because the arithmetic
that overflows does not throw.

**1337 is not prime.** It is 7 x 191. So the usual escape hatch of reducing the
exponent by Fermat's little theorem is not available in general, and there is a
sharper reason it is not available here: \`a\` may share a factor with the modulus.
\`a = 1337\` is a legal input and its answer is 0.

**The modulus is tiny, and that is what keeps \`int\` arithmetic safe.** Every value
kept during the run is a residue below 1337, and the largest product of two of
them is 1336 x 1336 = 1784896 — comfortably inside an \`int\`. This is the rare
modular problem where \`long\` is not needed anywhere, and it is worth knowing
*why* rather than getting away with it.

## 2. The brute force

Build the exponent, then multiply \`a\` by itself that many times, taking the
remainder as you go so nothing grows.

\`\`\`java SuperPowLoop.java @run-super-pow-super-pow-loop
static final int MOD = 1337;

static int superPow(int a, int[] b) {

    long e = 0;
    for (int digit : b) {
        e = e * 10 + digit;
    }

    int ans = 1;
    a %= MOD;

    for (long i = 0; i < e; i++) {
        ans = (ans * a) % MOD;
    }

    return ans;
}

static String exponent(int[] b) {

    StringBuilder written = new StringBuilder();
    for (int digit : b) {
        written.append(digit);
    }

    long e = 0;
    for (int digit : b) {
        e = e * 10 + digit;
    }

    return b.length + " digits, " + written + "  ->  a long says " + e;
}
\`\`\`

\`\`\`output @run-super-pow-super-pow-loop
superPow(2, new int[]{3})                                                                      -> 8
superPow(2, new int[]{1, 0})                                                                   -> 1024
superPow(2, new int[]{1, 1})                                                                   -> 711
superPow(2, new int[]{2, 0})                                                                   -> 368
exponent(new int[]{1, 1})                                                                      -> 2 digits, 11  ->  a long says 11
exponent(new int[]{1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5}) -> 25 digits, 1234567890123456789012345  ->  a long says 1096246371337559929
\`\`\`

\`\`\`demo SuperPowLoop.java
superPow(2, new int[]{3})
superPow(2, new int[]{1, 0})
superPow(2, new int[]{1, 1})
superPow(2, new int[]{2, 0})
exponent(new int[]{1, 1})
exponent(new int[]{1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5})
\`\`\`

### The code, line by line

- \`static final int MOD = 1337;\` — named once. It appears in three places below
  and a modulus typed out three times is a modulus that will eventually be typed
  differently in one of them.
- \`long e = 0;\` — the exponent, assembled. **This line is the bug**, and the rest
  of the method is a correct algorithm sitting on top of it.
- \`for (int digit : b) { e = e * 10 + digit; }\` — Horner's rule, which is simply
  what "reading a number left to right" is: multiply what you have by ten and add
  the next digit. Remember this loop; the fast version is the same shape with a
  different operation in it.
- \`int ans = 1;\` — the identity for multiplication, and also the correct answer
  for an exponent of 0, which the loop below then never has to special-case.
- \`a %= MOD;\` — reduce the base once, before anything multiplies it. \`a\` can be
  two billion and the very first product would otherwise be far outside an \`int\`.
- \`for (long i = 0; i < e; i++)\` — one turn per unit of the exponent. **This is
  the line that runs 10²⁰⁰⁰ times.**
- \`ans = (ans * a) % MOD;\` — multiply, then reduce. Reducing *every* turn rather
  than at the end is what keeps \`ans\` below 1337 and the product below 1.8
  million; leaving it to the end would overflow on turn five.
- \`exponent\` is not part of the answer. It prints the digits as written and then
  what a \`long\` makes of them, side by side.

## 3. Dry run of the brute force

\`superPow(2, [1, 1])\`. The first loop reads the digits into \`e = 11\`, then the
second loop turns eleven times:

| turn | ans before | x 2 | mod 1337 | ans after |
|---|---|---|---|---|
| 1 | 1 | 2 | 2 | 2 |
| 2 | 2 | 4 | 4 | 4 |
| 3 | 4 | 8 | 8 | 8 |
| … | … | … | … | … |
| 10 | 512 | 1024 | 1024 | 1024 |
| 11 | 1024 | 2048 | **711** | **711** |

Only the last turn has anything to reduce, and that is the whole reason \`int\` is
enough: the largest number that ever exists here is 2048.

Now read \`exponent\` in the output above. For \`[1, 1]\` the \`long\` says 11 and the
digits say 11, and they agree. For the twenty-five digit array they do not agree
at all — the digits read \`1234567890123456789012345\` and the \`long\` claims
\`1096246371337559929\`. **No exception, no warning, no sign that anything
happened.** The method went on to compute a perfectly good power of the wrong
number.

## 4. Why it is not enough

There are two separate failures here and it is worth keeping them apart, because
only one of them is about speed.

**The exponent does not exist as a number.** Twenty-five digits already wrapped
silently, and the statement allows two thousand. Even \`BigInteger\` only moves the
problem: it would hold the value honestly and then the loop below would ask for
10²⁰⁰⁰ turns of it.

**And the loop is O(b) in the value of b, not its length.** One turn per unit of
the exponent is the same trap [Pow(x, n)](problem:powx-n) and
[Divide Two Integers](problem:divide-two-integers) set, except that here the
input is written in a way that makes the size unmissable: \`b.length\` is the number
of *digits*, so the loop count is ten to that power.

The way out is already in the code, in the loop that was written off as
bookkeeping:

\`\`\`text
e = e * 10 + digit          reading 11 as (1) x 10 + 1
\`\`\`

Now raise \`a\` to what that builds, and use the one identity that matters:

\`\`\`text
a^(k x 10 + d)  =  (a^k)^10 x a^d
\`\`\`

**A multiplication in the exponent is a power on the outside, and an addition in
the exponent is a multiplication on the outside.** So the same left-to-right walk
works, with "multiply by ten and add the digit" replaced by "raise to the tenth
and multiply by \`a\` to the digit". The exponent is never assembled; it is
consumed one digit at a time and thrown away.

That turns 10²⁰⁰⁰ multiplications into about twenty per digit — at most forty
thousand for the longest input allowed, which is nothing.

Taking the remainder at every step is legal for the same reason it was legal in
the brute force: \`(x x y) mod m\` is \`((x mod m) x (y mod m)) mod m\`, so reducing
early never changes the final residue. **This is a claim about multiplication
only.** It does not extend to the exponent — reducing \`b\` itself modulo something
is a different theorem with a condition attached, and section 6 has the reason it
does not apply.

## 5. The plan, in pseudocode

\`\`\`pseudo
superPow(a, b):

    ans <- 1

    for each digit d of b, left to right:
        ans <- (ans^10 x a^d) mod 1337

    return ans


pow(base, e):                        e is never more than 10 here

    res  <- 1
    base <- base mod 1337

    repeat e times:
        res <- (res x base) mod 1337

    return res
\`\`\`

Two things to be clear about before writing it.

**\`ans^10\` is a power of the running answer, and \`a^d\` is a power of the original
base.** They are different bases and mixing them up gives a plausible-looking
method that is wrong from the second digit onwards.

**\`pow\` does not need to be clever.** Its exponent is either a single digit or the
constant 10, so it is at most ten turns of a loop. Squaring would make it four
instead of ten and would be four lines longer; that is a trade worth *not* making
here, and being able to say so is worth more in an interview than making it.

## 6. Walking the digits

\`\`\`java SuperPow.java @run-super-pow-super-pow
static final int MOD = 1337;

static int superPow(int a, int[] b) {

    int ans = 1;

    for (int digit : b) {
        ans = (pow(ans, 10) * pow(a, digit)) % MOD;
    }

    return ans;
}

static int pow(int a, int b) {

    int res = 1;
    a %= MOD;

    while (b > 0) {
        res = (res * a) % MOD;
        b--;
    }

    return res;
}

static String cost(int[] b) {

    int n = 0;
    for (int digit : b) {
        n += 10 + digit + 1;
    }

    return b.length + " digits  ->  " + n + " multiplications";
}

static int widest() {
    return (MOD - 1) * (MOD - 1);
}
\`\`\`

\`\`\`output @run-super-pow-super-pow
superPow(2, new int[]{3})                                                                  -> 8
superPow(2, new int[]{1, 0})                                                               -> 1024
superPow(2, new int[]{1, 1})                                                               -> 711
superPow(2, new int[]{2, 0})                                                               -> 368
superPow(3, new int[]{0})                                                                  -> 1
superPow(1, new int[]{4, 3, 3, 8, 5, 2})                                                   -> 1
superPow(1337, new int[]{9, 9})                                                            -> 0
superPow(2147483647, new int[]{2, 0, 0})                                                   -> 1198
cost(new int[]{1, 1})                                                                      -> 2 digits  ->  24 multiplications
cost(new int[]{1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5}) -> 25 digits  ->  380 multiplications
widest()                                                                                   -> 1784896
\`\`\`

\`\`\`demo SuperPow.java
superPow(2, new int[]{3})
superPow(2, new int[]{1, 0})
superPow(2, new int[]{1, 1})
superPow(2, new int[]{2, 0})
superPow(3, new int[]{0})
superPow(1, new int[]{4, 3, 3, 8, 5, 2})
superPow(1337, new int[]{9, 9})
superPow(2147483647, new int[]{2, 0, 0})
cost(new int[]{1, 1})
cost(new int[]{1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5})
widest()
\`\`\`

### The code, line by line

- \`int ans = 1;\` — the running answer, and at this point it stands for \`a\` raised
  to the empty prefix of \`b\`, which is \`a⁰\`. Every turn extends that prefix by one
  digit and the invariant holds all the way down.
- \`for (int digit : b)\` — **left to right, and that direction is not negotiable.**
  Horner reads the most significant digit first; reversed, the tenth powers land
  on the wrong digits and the answer is wrong for every \`b\` longer than one.
- \`pow(ans, 10)\` — the prefix so far, shifted up one decimal place *in the
  exponent*. This is the \`e * 10\` of the brute force, wearing a different
  operation.
- \`pow(a, digit)\` — the new digit's own contribution, and note the base: the
  **original** \`a\`, not \`ans\`. This is the \`+ digit\`.
- \`(… * …) % MOD\` — both factors are below 1337, so the product is below 1.8
  million and the reduction brings it back. Read \`widest()\` in the output above:
  1784896 is the largest number this method ever holds.
- \`int res = 1;\` in \`pow\` — the identity again, and it is what makes \`pow(x, 0)\`
  return 1 with no branch. \`superPow(3, [0])\` in the output is that case end to
  end.
- \`a %= MOD;\` in \`pow\` — the parameter, reduced in place before the loop. This is
  the line that handles \`a = 2147483647\` and it has to come first; one
  multiplication by an unreduced \`a\` would overflow.
- \`while (b > 0) { res = (res * a) % MOD; b--; }\` — a plain repeated
  multiplication, at most ten turns. \`b\` here is a local copy of the argument, so
  decrementing it costs the caller nothing.
- \`cost\` and \`widest\` are not part of the answer. One puts the work on screen, the
  other puts the overflow argument on screen.

**The shortcut not to take.** The reflex on seeing a huge exponent is Euler's
theorem: reduce \`b\` modulo φ(1337) = 1140 and exponentiate that instead. It is a
real theorem and it does not apply here, because it requires \`a\` and 1337 to be
coprime — and 1337 is 7 x 191, so any \`a\` that is a multiple of 7 or of 191
breaks it. Read \`superPow(1337, [9, 9])\` in the output: the answer is 0, and 1337
reduced modulo 1140 is 197, which would have produced something else entirely.
The digit walk needs no such condition, which is the other reason to prefer it.

## 7. Dry run of the fast version

\`superPow(2, [1, 1])\`, one row per digit. \`ans\` after the last row is the answer.

| digit read | ans before | pow(ans, 10) | pow(a, digit) | product | mod 1337 | ans means |
|---|---|---|---|---|---|---|
| — | 1 | — | — | — | 1 | 2⁰ |
| 1 | 1 | 1¹⁰ = 1 | 2¹ = 2 | 2 | 2 | 2¹ |
| 1 | 2 | 2¹⁰ = 1024 | 2¹ = 2 | 2048 | **711** | 2¹¹ |

The last column is the invariant, and it is what makes the method easy to check:
after reading the prefix \`1\` the answer stands for \`2¹\`, and after reading \`11\` it
stands for \`2¹¹\`. Two turns for an exponent of eleven, and eleven turns for the
brute force.

![The exponent digits folded in one at a time, each fold raising the running answer to the tenth](diagrams/super-pow-notes-horner.jpg)

Green is a fold — one digit read, the answer raised to the tenth and multiplied
through — and blue is the running answer sitting between two of them. The box at
the foot is the point of the whole thing: **the number 11 is never formed.** Only
its digits are ever touched, which is why two thousand of them cost no more than
two.

The same table for \`superPow(2, [2, 0])\`, where a digit of 0 shows what the
identity does when a digit contributes nothing:

| digit read | ans before | pow(ans, 10) | pow(a, digit) | mod 1337 | ans means |
|---|---|---|---|---|---|
| 2 | 1 | 1 | 2² = 4 | 4 | 2² |
| 0 | 4 | 4¹⁰ = 1048576 → 368 | 2⁰ = **1** | **368** | 2²⁰ |

\`pow(a, 0)\` is 1, so that turn is a pure tenth power and nothing else — exactly
what \`e * 10 + 0\` did in the brute force. And \`4¹⁰\` never appears as 1048576 in
the running code: \`pow\` reduces after every one of its ten multiplications, so
what actually passes through is a sequence of residues.

Read \`cost\` in the output above: twenty-five digits cost 380 multiplications.
Scale that to the longest input the statement allows and it is under forty
thousand — for an exponent with two thousand digits in it.

## 8. Key takeaways

- **Never build the exponent.** Two thousand digits fits in no primitive, and the
  attempt fails silently rather than throwing. Read \`b\` digit by digit instead.
- **The identity is \`a^(k x 10 + d) = (a^k)^10 x a^d\`.** Multiplication in the
  exponent becomes a power outside it; addition becomes a multiplication.
- **It is Horner's rule with the operations lifted one level.** \`e = e * 10 + d\`
  and \`ans = ans^10 x a^d\` are the same walk, and recognising that is the whole
  solve.
- **\`pow(ans, 10)\` uses the running answer; \`pow(a, digit)\` uses the original
  base.** Two different bases in one line, and swapping them is the common wrong
  answer.
- **Left to right, most significant digit first.** The array is given that way and
  reversing it silently changes which digit gets which power of ten.
- **Reduce after every multiplication.** \`(x x y) mod m = ((x mod m)(y mod m)) mod
  m\` is what makes that legal, and it keeps every value under 1337.
- **\`int\` is enough here, and say why.** 1336 x 1336 = 1784896. With a modulus of
  a billion instead of 1337 the same code would need \`long\`.
- **Reduce \`a\` before the first multiply.** \`a\` can be 2³¹ − 1; one unreduced
  product overflows.
- **Do not reach for Fermat or Euler.** 1337 = 7 x 191 is not prime and \`a\` need
  not be coprime to it — \`a = 1337\` returns 0 and breaks the shortcut outright.
- **O(len(b)) time, O(1) space.** Twenty multiplications per digit, at most.
- **Test \`[0]\`, \`[1,0]\`, a = 1337, and a = 2³¹ − 1.** Zero exponent, the tenth
  power on its own, a base that shares a factor with the modulus, and a base that
  needs reducing.
`;export{e as default};