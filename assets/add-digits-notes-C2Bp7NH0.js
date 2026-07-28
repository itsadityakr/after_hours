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

**6. Then ask what it costs** — the two sections below — and only after that go
looking for the O(1) trick at the bottom. In an interview the loop is the answer
and the formula is the follow-up; produced in the other order it looks like
something you memorised.

If you are stuck on step 2 or 3, **Hints** in the bar walks the same route
without showing the code.

## The loop

\`\`\`java AddDigits.java @run-add-digits
public class AddDigits {

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

    public static void main(String[] args) {
        for (int n : new int[] { 0, 9, 38, 12345, 999999999, Integer.MAX_VALUE })
            System.out.println(n + " -> " + addDigits(n));
    }
}
\`\`\`

\`\`\`output @run-add-digits
0 -> 0
9 -> 9
38 -> 2
12345 -> 6
999999999 -> 9
2147483647 -> 1
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

## Time — O(log n)

Every pass reads the digits of the number it is given, and a number has about
\`log10\` of it digits. So the first pass costs the digit count, and the passes
after it cost almost nothing — the second pass is over a number no larger than
90 whatever you started from.

![The passes the Add Digits loop makes, rising with the digits of the number rather than with the number](diagrams/add-digits-notes-time.jpg)

For an \`int\` the whole thing finishes in at most three rounds: the largest is
2147483647, its digits add to 46, those add to 10, and those add to 1. The cost
is the first pass, which makes it **O(log n)** — or O(d) in the digits, which
is the same statement and the more honest one.

## Space — O(1)

Two \`int\`s, \`num\` and \`sum\`, whatever the number is. Nothing is collected and
nothing recurses, so the memory does not move.

![The memory Add Digits uses staying flat as the number grows](diagrams/add-digits-notes-space.jpg)

## The O(1) answer, without a loop

The follow-up asks for it without the loop, and there is one, because
\`10 ≡ 1 (mod 9)\`: every power of ten leaves a remainder of 1 when divided by
nine, so a number and its digit sum always leave the *same* remainder. Repeating
the digit sum therefore lands on the number's remainder mod 9 — with 9 itself
standing in for a remainder of 0.

\`\`\`java
static int addDigits(int num) {
    return num == 0 ? 0 : 1 + (num - 1) % 9;
}
\`\`\`

Know it, but write the loop first unless the follow-up is asked. The loop is
what shows you can turn the rule into code; the formula is what shows you have
seen this problem before.

| | Cost | Why |
|---|---|---|
| Time | O(log n) | one read of each digit, and at most three passes |
| Space | O(1) | two \`int\`s, whatever the input |
| With the formula | O(1) | one remainder, no loop at all |
`;export{e as default};