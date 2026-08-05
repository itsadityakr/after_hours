var e=`Add the digits of a number. If the answer still has more than one digit, add its
digits too, and keep going until one digit is left. 38 becomes 3 + 8 = 11, which
becomes 1 + 1 = 2.

## 1. The problem

Given a non-negative integer \`num\`, repeatedly add its digits until the result
has a single digit, and return it.

- **In** — \`num\`, an \`int\`, and \`0 <= num <= 2³¹ − 1\`.
- **Out** — a single digit, 0 to 9.
- **The rule** — it contains itself: *add the digits, and if that still has more
  than one digit, do it again.*

That last number has a name: it is the **digital root**. Two facts from the
constraints matter. \`num\` can be 0, which is already a single digit, so the
answer is 0 and nothing should happen. And the largest \`int\` is 2147483647,
whose digits add to 46 — so however big the input, the second round is working
with a number below 100.

## 2. The brute force

The rule says "repeat until one digit", so it is a loop wrapped around the digit
sum — two loops, one inside the other.

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

### The code, line by line

- \`while (num >= 10)\` — the outer loop, and this condition **is** the
  specification. "More than one digit" means "at least ten", so a number that is
  already one digit never enters the loop and comes straight back out. That is
  why 0 and 9 need no special case.
- \`int sum = 0;\` — declared **inside** the outer loop, so it restarts at 0 for
  each pass. Hoist it out and it accumulates across passes, and every input
  needing a second round comes back wrong.
- \`while (num > 0)\` — the inner loop: the digit loop, and nothing else.
- \`sum += num % 10;\` — \`% 10\` is the last digit.
- \`num /= 10;\` — integer division drops that digit. Together these two lines walk
  a number from its right-hand end and stop when nothing is left.
- \`num = sum;\` — the inner loop **consumed** \`num\`; by now it is 0. This line
  refills it with the digit sum, which is the only thing the next pass needs.
- \`return num;\` — reached when \`num\` is below 10, so it is the single digit.

## 3. Dry run of the brute force

\`num = 12345\`. The inner loop runs to completion, then the outer loop asks
whether to go round again.

| pass | inner step | num | num % 10 | sum after | num after |
|---|---|---|---|---|---|
| 1 | 1 | 12345 | 5 | 5 | 1234 |
| 1 | 2 | 1234 | 4 | 9 | 123 |
| 1 | 3 | 123 | 3 | 12 | 12 |
| 1 | 4 | 12 | 2 | 14 | 1 |
| 1 | 5 | 1 | 1 | 15 | 0 |
| 1 | end | 0 | — | 15 | \`num = 15\`, and 15 >= 10 so go again |
| 2 | 1 | 15 | 5 | 5 | 1 |
| 2 | 2 | 1 | 1 | 6 | 0 |
| 2 | end | 0 | — | 6 | \`num = 6\`, and 6 < 10 so stop |

Returns **6**. The whole run as a chain, with the number of digits shrinking each
pass:

![3. Dry run of the brute force — diagram](diagrams/add-digits-notes-mm-1.jpg)

**Two passes, not five.** The first pass does the real work — one step per digit
— and the second is over a two-digit number. That collapse is the point of the
next section.

Now the input that needs no work at all, \`num = 9\`:

| pass | what happens |
|---|---|
| — | \`9 >= 10\` is false, so the outer loop body never runs |
| — | \`return num\` → **9** |

Neither loop executes. The same is true of 0. **No guard, no special case** — the
outer condition already said it.

## 4. Why it is not enough

It is enough, and saying otherwise would be inventing a problem. Time is
O(log num) — a number has about that many digits — and space is O(1).

What is worth knowing is how few passes there really are. The first pass reads
every digit; after that you are working with the digit sum, which for any \`int\`
is at most 46. So the whole thing is:

| input | pass 1 | pass 2 | pass 3 |
|---|---|---|---|
| 2147483647 | 46 | 10 | 1 |
| 999999999 | 81 | 9 | — |
| 12345 | 15 | 6 | — |

**Three rounds at the very outside**, whatever you feed it. The loop is not slow.

Where the follow-up goes is the *number of operations*, not the complexity class:
an interviewer who has seen this problem will ask for it **with no loop at all**.
There is a closed form, it comes from what remainders behave like when you divide
by nine, and it is one line. Work out why the digit sum of a number leaves the
same remainder mod 9 as the number itself, and you will have found it.

## 5. Key takeaways

- **A rule that contains itself is a loop around the rule.** "Add the digits, and
  if it still has more than one digit, do it again" is the digit loop with a
  \`while\` around it, and spotting that is most of the work.
- **Write the outer condition in the question's own words**, then translate:
  "more than one digit" is \`num >= 10\`. Written that way, 0 and 9 need no special
  case — the condition already excludes them.
- **\`sum\` must be declared inside the outer loop.** Outside it, it accumulates
  across passes and every multi-round input is wrong.
- **\`% 10\` takes the last digit, \`/ 10\` drops it.** That pair is the digit loop,
  and it comes back in every digit problem on the sheet.
- **It costs at most three passes for any \`int\`**, because the digit sum of the
  largest one is 46.
- **The follow-up is "now do it without a loop."** There is a one-line closed
  form; the argument for it is about remainders mod 9.
`;export{e as default};