var e=`Does the number read the same backwards? 121 does, 123 does not, and −121 does
not — the minus sign is at one end and nowhere else. The interesting version of
the question is the follow-up: **do it without turning the number into a
string.**

## How to approach it

**1. Write the four awkward inputs down before you write anything else.** −121,
10, 0, 1221. Every wrong solution to this problem is wrong on one of those, and
a list of them on paper is a test suite you can run in your head.

**2. Solve it the easy way first, and know that you have.** Text, reversed,
compared. It is correct, it takes a minute, and it gives you something to check
the real answer against. Then read the follow-up — *without converting to a
string* — which is the version being asked for.

**3. Ask what the follow-up is actually testing.** Not "can you avoid a
\`String\`". It is testing whether you notice that reversing the *whole* number
can overflow an \`int\` even when the number did not, and whether you can find the
way round that instead of reaching for a \`long\`.

**4. Look for the smaller job.** Comparing a word with its reverse is really
comparing its front half with its back half. Half the work is already there in
the question, and finding the smaller equivalent job is the move that most
"clever" solutions in this topic come down to.

**5. Work your loop by hand on both lengths.** 1221 and 12321. They end in
different states, and a solution that only handles the first is a solution that
passes the example and fails the submission.

**6. Then price the three versions against each other.** They take the same
time. They do not take the same memory, and one of them rests on an argument you
would not want to have to make — which is exactly what the follow-up wanted you
to see.

If you are stuck at step 3 or 4, **Hints** in the bar takes the same route one
step at a time.

## Approach 1 — reverse it as text

\`\`\`java PalindromeString.java @run-palindrome-number-palindrome-string
static boolean isPalindrome(int num) {
    String text = String.valueOf(num);
    String reversed = new StringBuilder(text).reverse().toString();

    return text.equals(reversed);
}
\`\`\`

\`\`\`output @run-palindrome-number-palindrome-string
isPalindrome(121)  -> true
isPalindrome(1221) -> true
isPalindrome(-121) -> false
isPalindrome(10)   -> false
isPalindrome(0)    -> true
isPalindrome(123)  -> false
\`\`\`

\`\`\`demo PalindromeString.java
isPalindrome(121)
isPalindrome(1221)
isPalindrome(-121)
isPalindrome(10)
isPalindrome(0)
isPalindrome(123)
\`\`\`

It is correct, it is three lines, and it handles the minus sign for free —
\`"-121"\` reversed is \`"121-"\`, which is not equal to it. Write this if the
question does not forbid it.

![The number turned into text, reversed, and compared](diagrams/palindrome-number-notes-a1-text.jpg)

What it costs is two strings and a builder for a question about a number. That
is the whole of the follow-up: the answer is decided by the digits, and the
digits are available with \`% 10\` without allocating anything.

## Approach 2 — reverse the whole number

The obvious way to drop the string: build the reverse arithmetically and compare
it with the original. It is the version most people write second, and it is
worth writing to find out what is wrong with it.

\`\`\`java PalindromeReverse.java @run-palindrome-number-palindrome-reverse
static int reverseAsInt(int num) {
    int reversed = 0;
    for (int x = num; x > 0; x /= 10) reversed = reversed * 10 + x % 10;
    return reversed;
}

static long reverseAsLong(int num) {
    long reversed = 0;
    for (int x = num; x > 0; x /= 10) reversed = reversed * 10 + x % 10;
    return reversed;
}

static boolean isPalindrome(int num) {
    return num >= 0 && reverseAsLong(num) == num;
}
\`\`\`

\`\`\`output @run-palindrome-number-palindrome-reverse
reverseAsInt(1221)        -> 1221
reverseAsInt(1234567899)  -> 1397719729
reverseAsLong(1234567899) -> 9987654321
isPalindrome(2147447412)  -> true
isPalindrome(1234567899)  -> false
\`\`\`

\`\`\`demo PalindromeReverse.java
reverseAsInt(1221)
reverseAsInt(1234567899)
reverseAsLong(1234567899)
isPalindrome(2147447412)
isPalindrome(1234567899)
\`\`\`

**Look at the two reversals of 1234567899.** It reverses to 9987654321, which
does not fit in an \`int\` — so \`reverseAsInt\` hands back a wrapped number that is
not the reverse of anything. Compare *that* with the original and you still get
"not a palindrome", and you get it by luck: the wrapped value simply happened
not to collide. That is not an argument you want to be making about your own
code.

![The whole number being rebuilt digit by digit, and where it stops fitting](diagrams/palindrome-number-notes-a2-reverse.jpg)

A \`long\` accumulator removes the problem and is a perfectly good answer — the
reverse of an \`int\` always fits in one. It is also the point at which a good
interviewer asks whether you need the whole reverse at all.

## Approach 3 — reverse only half of it

\`\`\`java Palindrome.java @run-palindrome-number-palindrome
static boolean isPalindrome(int x) {
    if (x < 0 || (x % 10 == 0 && x != 0))
        return false;

    int reversedHalf = 0;

    while (x > reversedHalf) {
        reversedHalf = reversedHalf * 10 + x % 10;
        x /= 10;
    }

    return x == reversedHalf || x == reversedHalf / 10;
}
\`\`\`

\`\`\`output @run-palindrome-number-palindrome
isPalindrome(121)   -> true
isPalindrome(1221)  -> true
isPalindrome(12321) -> true
isPalindrome(-121)  -> false
isPalindrome(10)    -> false
isPalindrome(0)     -> true
isPalindrome(123)   -> false
\`\`\`

\`\`\`demo Palindrome.java
isPalindrome(121)
isPalindrome(1221)
isPalindrome(12321)
isPalindrome(-121)
isPalindrome(10)
isPalindrome(0)
isPalindrome(123)
\`\`\`

**Only half the number is reversed, and that is the point.** Reversing all of
\`x\` can overflow an \`int\` even when \`x\` itself did not — the reverse of a
ten-digit number need not fit in ten digits. Stopping at the middle means
\`reversedHalf\` never grows past the half of \`x\` still standing, so there is
nothing to overflow and no \`long\` to reach for.

![The half-reversal meeting in the middle of 12321, and the two guards in front of it](diagrams/palindrome-number-notes-half.jpg)

The two guards in front of the loop are both necessary.

**\`x < 0\`** — a negative number is never a palindrome, and it would also make
the loop misbehave: Java's \`%\` keeps the sign of the left operand.

**\`x % 10 == 0 && x != 0\`** — a number ending in zero cannot read the same
backwards, because the reverse would have to start with a zero and numbers do
not. Without the second half of that test, 0 itself would be rejected, and 0 is
a palindrome.

**\`x > reversedHalf\`** is what finds the middle. Each pass moves one digit from
the front half to the back, so the loop ends the moment the back is as long as
the front.

**The two returns are the two lengths.** For an even digit count the halves are
equal — 1221 ends with \`x\` 12 and \`reversedHalf\` 12. For an odd one the middle
digit is stuck on the reversed side, so 12321 ends with \`x\` 12 and
\`reversedHalf\` 123, and dropping that middle digit with \`/ 10\` makes them agree.

## What the three cost

All three read the digits and nothing else, so all three are **O(log n)** in the
value — or O(d) in the digits, which is the same sentence. **Time is the yellow
line, memory the green one**, and the only thing that separates these versions
is where the green one goes.

![Time and memory for all three versions on one pair of axes](diagrams/palindrome-number-notes-cost.jpg)

| Approach | Time | Space | |
|---|---|---|---|
| 1 — reverse as text | O(log n) | O(log n) — three allocations | fine unless the follow-up is asked |
| 2 — reverse the number | O(log n) | O(1) | needs a \`long\`, or an overflow argument |
| 3 — reverse half of it | O(log n) | O(1) — two \`int\`s | **write this one** |

\`String.valueOf\` builds a string of \`d\` characters, \`StringBuilder.reverse\`
builds another, and \`toString\` a third — that is the green line rising in the
first version, for a question that needs no memory at all.

The three agree on every input. What separates them is what you have to claim to
defend them: the first allocates, the second needs you to say why a wrapped
\`int\` cannot lie to you, and the third simply never builds a number big enough
for the question to arise.
`;export{e as default};