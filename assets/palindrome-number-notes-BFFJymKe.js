var e=`Does the number read the same backwards? 121 does, 123 does not, and −121 does
not — the minus sign is at one end and nowhere else. The interesting version of
the question is the follow-up: **do it without turning the number into a
string.**

## 1. The problem

Given an integer \`num\`, return \`true\` if it is a palindrome.

- **In** — \`num\`, an \`int\`, and \`−2³¹ <= num <= 2³¹ − 1\`.
- **Out** — \`boolean\`.
- **Palindrome** — reads the same forwards and backwards.

Three inputs settle the definition before any code:

| num | answer | why |
|---|---|---|
| 121 | \`true\` | the ordinary case |
| −121 | \`false\` | reversed it reads \`121−\`, and the sign only ever sits at the front |
| 10 | \`false\` | reversed it is \`01\`, which is 1, not 10 |
| 0 | \`true\` | a single digit, and single digits always are |

**Every negative number is false**, and it is worth saying why rather than
remembering it: the minus is at one end and never at the other, so no negative
number can read the same both ways.

**Trailing zeros are the other trap.** Any number ending in 0 — except 0 itself —
cannot be a palindrome, because the reversed version would have to start with 0
and numbers do not.

## 2. The plan, in pseudocode

\`\`\`pseudo
isPalindrome(num):

    text     <- num written out as characters
    reversed <- text, backwards

    return text = reversed
\`\`\`

Three lines, and it needs no cases at all. **The minus sign handles itself**:
\`"-121"\` reversed is \`"121-"\`, which is not equal to \`"-121"\`, so negatives come
back false without a guard. The same is true of trailing zeros — \`"10"\` against
\`"01"\`.

That is the argument for writing this version first. Every special case in the
table above is a special case of the *arithmetic* solution, not of this one.

## 3. The brute force

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

### The code, line by line

- \`String.valueOf(num)\` — the number as characters, sign included. That inclusion
  is what makes the negative case work for free.
- \`new StringBuilder(text).reverse()\` — \`String\` has no \`reverse\`, so this is the
  standard route. \`StringBuilder\` is the mutable one, and \`reverse()\` turns it
  round in place.
- \`.toString()\` — back to a \`String\`, because that is what the comparison needs.
- \`text.equals(reversed)\` — **\`equals\`, never \`==\`.** \`==\` on two \`String\`s asks
  whether they are the same object, and these two never are. It would return
  \`false\` for every input, including 121 — a bug that looks like a wrong algorithm
  and is not.

## 4. Dry run of the brute force

Four inputs, one row each, showing the two strings being compared.

| num | text | reversed | equal? | returns |
|---|---|---|---|---|
| 121 | \`"121"\` | \`"121"\` | yes | **true** |
| 123 | \`"123"\` | \`"321"\` | no | false |
| −121 | \`"-121"\` | \`"121-"\` | no | **false** |
| 10 | \`"10"\` | \`"01"\` | no | **false** |
| 0 | \`"0"\` | \`"0"\` | yes | **true** |

The two awkward cases, character by character — the mismatch is found at the very
first position in both:

![4. Dry run of the brute force — diagram](diagrams/palindrome-number-notes-mm-1.jpg)

**Both fail on position 0.** For −121 the sign meets a digit; for 10 the 1 meets
a 0. Neither needed a rule of its own — reversing the *text* preserves the sign
character and the trailing zero, and the comparison notices.

## 5. Why it is not enough

It is correct, and its complexity is fine: **O(d) time and O(d) space**, where
\`d\` is the number of digits — at most 10 for an \`int\`.

The problem is the O(d) space, and the fact that the follow-up bans this approach
outright. **"Solve it without converting the integer to a string"** is printed on
the question, so a solution that converts is answering the easy half.

Two strings are allocated here to answer a question about arithmetic, and the
digits were already reachable: \`% 10\` gives the last one, \`/ 10\` drops it — the
same pair every other digit problem uses.

The arithmetic version builds the reversed number instead of the reversed text.
And **the moment you do that, every case this page got for free comes back as
your problem**:

- Negatives no longer reverse into something obviously different, so they need a
  guard of their own.
- Trailing zeros need one too — 10 reversed is 1, and \`10 != 1\` happens to be
  right, but the reasoning is worth checking rather than assuming.
- And reversing a number near the top of the range can **overflow**, because the
  reverse of a valid \`int\` need not be one. Reversing only half the digits and
  comparing the two halves avoids that entirely, which is the elegant version.

That is the whole trade: this page's method has no special cases because the
string carries the sign and the zeros; the arithmetic one is faster and has three.

## 6. Key takeaways

- **Every negative number is false**, because the minus is at one end and never
  the other. Reason it out rather than memorising it.
- **Any number ending in 0 is false, except 0 itself** — the reverse would have
  to start with a zero.
- **\`equals\`, not \`==\`.** \`==\` compares object identity and would return \`false\`
  for everything.
- **The string version needs no special cases**, and that is its real argument —
  the sign and the trailing zeros are carried by the characters.
- **O(d) time and O(d) space**, at most ten digits for an \`int\`.
- **The follow-up bans it.** The arithmetic version costs O(1) space and has to
  handle negatives, trailing zeros, and the overflow of the reversed value —
  which is why reversing only half the digits is the version worth learning.
`;export{e as default};