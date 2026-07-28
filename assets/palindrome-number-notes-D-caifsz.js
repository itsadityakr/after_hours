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

**6. Then price the two versions against each other.** They take the same time.
They do not take the same memory, and that difference is the reason the second
one exists — which is exactly what the follow-up wanted you to see.

If you are stuck at step 3 or 4, **Hints** in the bar takes the same route one
step at a time.

## The obvious one, with a string

\`\`\`java
String reversed = new StringBuilder(String.valueOf(num))
        .reverse()
        .toString();

return String.valueOf(num).equals(reversed);
\`\`\`

It is correct, it is three lines, and it handles the minus sign for free —
\`"-121"\` reversed is \`"121-"\`, which is not equal to it. Write this if the
question does not forbid it.

What it costs is two strings and a builder for a question about a number. That
is the whole of the follow-up: the answer is decided by the digits, and the
digits are available with \`% 10\` without allocating anything.

## The one without a string

\`\`\`java Palindrome.java @run-palindrome-number
public class Palindrome {

    static boolean byString(int num) {
        String reversed = new StringBuilder(String.valueOf(num))
                .reverse()
                .toString();

        return String.valueOf(num).equals(reversed);
    }

    static boolean byHalf(int x) {
        if (x < 0 || (x % 10 == 0 && x != 0))
            return false;

        int reversedHalf = 0;

        while (x > reversedHalf) {
            reversedHalf = reversedHalf * 10 + x % 10;
            x /= 10;
        }

        return x == reversedHalf || x == reversedHalf / 10;
    }

    public static void main(String[] args) {
        for (int n : new int[] { 121, 1221, 12321, -121, 10, 0, 123 })
            System.out.printf("%7d   string %-6b half %b%n", n, byString(n), byHalf(n));
    }
}
\`\`\`

\`\`\`output @run-palindrome-number
    121   string true   half true
   1221   string true   half true
  12321   string true   half true
   -121   string false  half false
     10   string false  half false
      0   string true   half true
    123   string false  half false
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

## Time — O(log n)

Both solutions read each digit once, so both are **O(log n)** in the value, or
O(d) in the digits. The half-reversal reads half of them, which is the same
thing once the constant is dropped.

![Both solutions rising with the digits of the number rather than with the number itself](diagrams/palindrome-number-notes-time.jpg)

## Space — where they differ

This is the whole reason the second version exists.

![The string version allocating in step with the digits while the half reversal stays flat](diagrams/palindrome-number-notes-space.jpg)

\`String.valueOf\` builds a string of \`d\` characters, \`StringBuilder.reverse\`
builds another, and \`toString\` a third — **O(log n)** memory for a question that
needs none. The half-reversal keeps two \`int\`s, whatever the number:
**O(1)**.

| | Time | Space |
|---|---|---|
| String reverse | O(log n) | O(log n) — three allocations |
| Half reversal | O(log n) | O(1) — two \`int\`s |
`;export{e as default};