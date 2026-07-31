var e=`Replace a number by the sum of the squares of its digits. Do it again. Keep
going: if you reach 1 the number is **happy**, and if you never do, you loop
forever. The digit part is this topic's own loop — the problem is the *forever*,
because a program that loops forever is not an answer.

## How to approach it

**1. Do 19 by hand.** 1² + 9² = 82, then 64 + 4 = 68, then 36 + 64 = 100, then 1.
Four steps and it is happy. Now do 2: 4, 16, 37, 58, 89, 145, 42, 20, 4 — and
you are back at 4, which you have already seen.

**2. Notice that there are only two endings.** The chain either reaches 1, or it
comes back to a number it has already been at. There is no third possibility:
the numbers cannot grow without bound — three digits can never square-sum past
243 — so the chain is trapped in a finite set and must eventually repeat.

**3. So the whole problem is "spot the repeat".** The digit-square loop is
already written for you by the topic; the question is what to compare against.

**4. Choose how you notice a repeat.** Remember every number you have seen, or
know the one number every unhappy chain visits, or walk the chain at two speeds
and wait for them to collide. Those are the three approaches below.

**5. Write the digit-square step as its own thing.** Every version needs it and
none of them needs it inline — pulling it out is what makes the third version
readable at all.

## Approach 1 — stop at 4

\`\`\`java Happy.java @run-happy-number-happy
static boolean isHappy(int n) {

    while (true) {

        int sum = 0;

        while (n > 0) {
            int digit = n % 10;
            sum += digit * digit;
            n /= 10;
        }

        if (sum == 1) {
            return true;
        }

        if (sum == 4) {
            return false;
        }

        n = sum;
    }
}
\`\`\`

\`\`\`output @run-happy-number-happy
isHappy(1)   -> true
isHappy(7)   -> true
isHappy(19)  -> true
isHappy(2)   -> false
isHappy(4)   -> false
isHappy(116) -> false
\`\`\`

\`\`\`demo Happy.java
isHappy(1)
isHappy(7)
isHappy(19)
isHappy(2)
isHappy(4)
isHappy(116)
\`\`\`

**\`while (true)\` with two ways out is the honest shape here**, because the loop
genuinely has no counter — it runs until one of two facts is discovered. The
inner loop is the digit loop unchanged.

![The loop with its two ways out, one for happy and one for the ring](diagrams/happy-number-notes-a1-exits.jpg)

**The whole solution is the number 4**, and it is worth being uncomfortable
about. Every unhappy number reaches it, so meeting 4 means unhappy — that is a
true fact, it makes this the fastest version on the page, and it is a fact the
code does not justify. The section below justifies it.

## Approach 2 — remember everything you have seen

For later, once sets are on the sheet. This is the version that needs no fact
about the number 4 at all: keep what you have visited and stop when something
comes round twice.

\`\`\`java HappySeen.java @run-happy-number-happy-seen
static boolean isHappy(int n) {
    HashSet<Integer> seen = new HashSet<>();

    while (n != 1 && !seen.contains(n)) {
        seen.add(n);

        int sum = 0;

        while (n > 0) {
            int digit = n % 10;
            sum += digit * digit;
            n /= 10;
        }

        n = sum;
    }

    return n == 1;
}
\`\`\`

\`\`\`output @run-happy-number-happy-seen
isHappy(1)   -> true
isHappy(7)   -> true
isHappy(19)  -> true
isHappy(2)   -> false
isHappy(4)   -> false
isHappy(116) -> false
\`\`\`

\`\`\`demo HappySeen.java
isHappy(1)
isHappy(7)
isHappy(19)
isHappy(2)
isHappy(4)
isHappy(116)
\`\`\`

**The two exits are in the \`while\` condition rather than in the body**, which is
why the method ends with \`return n == 1\` — by the time the loop is finished, \`n\`
is either 1 or something already visited, and the one comparison tells the two
apart.

![The set filling up until a number comes round for the second time](diagrams/happy-number-notes-a2-seen.jpg)

**This is the version to reach for on a problem you have never seen**, because
it needs nothing but the definition. "Repeat means a cycle" is the whole idea,
and it transfers to every chase-the-chain problem there is; the number 4 does
not transfer anywhere.

The \`HashSet\` is what it costs — see the chart at the bottom.

## Approach 3 — two speeds, and wait for a collision

For later still, when linked lists introduce **Floyd's cycle detection**. Walk
the chain twice at once: one step at a time, and two steps at a time. If the
chain ends in a loop the fast walker laps the slow one and they land on the same
number; if it ends at 1 they meet there, because 1 squares to itself.

\`\`\`java HappyFloyd.java @run-happy-number-happy-floyd
static int squareSum(int n) {
    int sum = 0;

    while (n > 0) {
        int digit = n % 10;
        sum += digit * digit;
        n /= 10;
    }

    return sum;
}

static boolean isHappy(int n) {
    int slow = n;
    int fast = n;

    do {
        slow = squareSum(slow);
        fast = squareSum(squareSum(fast));
    } while (slow != fast);

    return slow == 1;
}
\`\`\`

\`\`\`output @run-happy-number-happy-floyd
isHappy(1)   -> true
isHappy(7)   -> true
isHappy(19)  -> true
isHappy(2)   -> false
isHappy(4)   -> false
isHappy(116) -> false
\`\`\`

\`\`\`demo HappyFloyd.java
isHappy(1)
isHappy(7)
isHappy(19)
isHappy(2)
isHappy(4)
isHappy(116)
\`\`\`

**\`do\`-\`while\` and not \`while\`, because they start together.** Both begin at \`n\`,
so a \`while (slow != fast)\` loop would find them equal before either has moved
and stop immediately. The body has to run once before the test.

**Nothing is stored.** Two \`int\`s chase each other through a chain that may be
thousands of numbers long, and the memory does not move — which is the whole
reason this technique exists and why it comes back on every linked-list problem.

![Slow and fast walking the chain from 2 until they land on the same number](diagrams/happy-number-notes-floyd.jpg)

## Why every unhappy number reaches 4

The chains are not arbitrary. Squaring digits cannot make a number grow for
long: 999 gives 243, and no three-digit number can produce more than that, so
everything above 243 comes down and stays down. Inside that small range the
chain has nowhere to go, and every start that is not happy walks into the same
eight-number ring.

![The happy chain from 19 reaching 1, and the unhappy chain from 2 falling into the ring](diagrams/happy-number-notes-chains.jpg)

That is why approach 1 can test one number instead of a set: 4 is on the ring,
so an unhappy chain is guaranteed to stand on it sooner or later.

## What the three cost

**Time is the yellow line, memory the green one.** All three walk the same chain,
so all three take the same time; the difference is entirely in what they keep.

![Time and memory for all three versions on one pair of axes](diagrams/happy-number-notes-cost.jpg)

The chain from \`n\` shortens the number to three digits almost immediately and
then wanders inside a fixed set, so the work is "read the digits" — O(log n) —
repeated a bounded number of times.

| Approach | Time | Space | |
|---|---|---|---|
| 1 — stop at 4 | O(log n) | O(1) | fastest, and rests on a fact it does not show |
| 2 — remember what you have seen | O(log n) | O(log n) — the set | **the one to know first** |
| 3 — Floyd | O(log n) | O(1) | the technique, borrowed from linked lists |
`;export{e as default};