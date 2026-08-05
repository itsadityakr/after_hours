var e=`Replace a number by the sum of the squares of its digits. Do it again. Keep\r
going: if you reach 1 the number is **happy**, and if you never do, you loop\r
forever. The digit part is this topic's own loop — the problem is the *forever*,\r
because a program that loops forever is not an answer.\r
\r
## How to approach it\r
\r
**1. Do 19 by hand.** 1² + 9² = 82, then 64 + 4 = 68, then 36 + 64 = 100, then 1.\r
Four steps and it is happy. Now do 2: 4, 16, 37, 58, 89, 145, 42, 20, 4 — and\r
you are back at 4, which you have already seen.\r
\r
**2. Notice that there are only two endings.** The chain either reaches 1, or it\r
comes back to a number it has already been at. There is no third possibility:\r
the numbers cannot grow without bound — three digits can never square-sum past\r
243 — so the chain is trapped in a finite set and must eventually repeat.\r
\r
**3. So the whole problem is "spot the repeat".** The digit-square loop is\r
already written for you by the topic; the question is what to compare against.\r
\r
**4. Choose how you notice a repeat.** Remember every number you have seen, or\r
know the one number every unhappy chain visits, or walk the chain at two speeds\r
and wait for them to collide. Those are the three approaches below.\r
\r
**5. Write the digit-square step as its own thing.** Every version needs it and\r
none of them needs it inline — pulling it out is what makes the third version\r
readable at all.\r
\r
## Approach 1 — stop at 4\r
\r
\`\`\`java Happy.java @run-happy-number-happy\r
static boolean isHappy(int n) {\r
\r
    while (true) {\r
\r
        int sum = 0;\r
\r
        while (n > 0) {\r
            int digit = n % 10;\r
            sum += digit * digit;\r
            n /= 10;\r
        }\r
\r
        if (sum == 1) {\r
            return true;\r
        }\r
\r
        if (sum == 4) {\r
            return false;\r
        }\r
\r
        n = sum;\r
    }\r
}\r
\`\`\`\r
\r
\`\`\`output @run-happy-number-happy\r
isHappy(1)   -> true\r
isHappy(7)   -> true\r
isHappy(19)  -> true\r
isHappy(2)   -> false\r
isHappy(4)   -> false\r
isHappy(116) -> false\r
\`\`\`\r
\r
\`\`\`demo Happy.java\r
isHappy(1)\r
isHappy(7)\r
isHappy(19)\r
isHappy(2)\r
isHappy(4)\r
isHappy(116)\r
\`\`\`\r
\r
**\`while (true)\` with two ways out is the honest shape here**, because the loop\r
genuinely has no counter — it runs until one of two facts is discovered. The\r
inner loop is the digit loop unchanged.\r
\r
![The loop with its two ways out, one for happy and one for the ring](diagrams/happy-number-notes-a1-exits.jpg)\r
\r
**The whole solution is the number 4**, and it is worth being uncomfortable\r
about. Every unhappy number reaches it, so meeting 4 means unhappy — that is a\r
true fact, it makes this the fastest version on the page, and it is a fact the\r
code does not justify. The section below justifies it.\r
\r
## Approach 2 — remember everything you have seen\r
\r
For later, once sets are on the sheet. This is the version that needs no fact\r
about the number 4 at all: keep what you have visited and stop when something\r
comes round twice.\r
\r
\`\`\`java HappySeen.java @run-happy-number-happy-seen\r
static boolean isHappy(int n) {\r
    HashSet<Integer> seen = new HashSet<>();\r
\r
    while (n != 1 && !seen.contains(n)) {\r
        seen.add(n);\r
\r
        int sum = 0;\r
\r
        while (n > 0) {\r
            int digit = n % 10;\r
            sum += digit * digit;\r
            n /= 10;\r
        }\r
\r
        n = sum;\r
    }\r
\r
    return n == 1;\r
}\r
\`\`\`\r
\r
\`\`\`output @run-happy-number-happy-seen\r
isHappy(1)   -> true\r
isHappy(7)   -> true\r
isHappy(19)  -> true\r
isHappy(2)   -> false\r
isHappy(4)   -> false\r
isHappy(116) -> false\r
\`\`\`\r
\r
\`\`\`demo HappySeen.java\r
isHappy(1)\r
isHappy(7)\r
isHappy(19)\r
isHappy(2)\r
isHappy(4)\r
isHappy(116)\r
\`\`\`\r
\r
**The two exits are in the \`while\` condition rather than in the body**, which is\r
why the method ends with \`return n == 1\` — by the time the loop is finished, \`n\`\r
is either 1 or something already visited, and the one comparison tells the two\r
apart.\r
\r
![The set filling up until a number comes round for the second time](diagrams/happy-number-notes-a2-seen.jpg)\r
\r
**This is the version to reach for on a problem you have never seen**, because\r
it needs nothing but the definition. "Repeat means a cycle" is the whole idea,\r
and it transfers to every chase-the-chain problem there is; the number 4 does\r
not transfer anywhere.\r
\r
The \`HashSet\` is what it costs — see the chart at the bottom.\r
\r
## Approach 3 — two speeds, and wait for a collision\r
\r
For later still, when linked lists introduce **Floyd's cycle detection**. Walk\r
the chain twice at once: one step at a time, and two steps at a time. If the\r
chain ends in a loop the fast walker laps the slow one and they land on the same\r
number; if it ends at 1 they meet there, because 1 squares to itself.\r
\r
\`\`\`java HappyFloyd.java @run-happy-number-happy-floyd\r
static int squareSum(int n) {\r
    int sum = 0;\r
\r
    while (n > 0) {\r
        int digit = n % 10;\r
        sum += digit * digit;\r
        n /= 10;\r
    }\r
\r
    return sum;\r
}\r
\r
static boolean isHappy(int n) {\r
    int slow = n;\r
    int fast = n;\r
\r
    do {\r
        slow = squareSum(slow);\r
        fast = squareSum(squareSum(fast));\r
    } while (slow != fast);\r
\r
    return slow == 1;\r
}\r
\`\`\`\r
\r
\`\`\`output @run-happy-number-happy-floyd\r
isHappy(1)   -> true\r
isHappy(7)   -> true\r
isHappy(19)  -> true\r
isHappy(2)   -> false\r
isHappy(4)   -> false\r
isHappy(116) -> false\r
\`\`\`\r
\r
\`\`\`demo HappyFloyd.java\r
isHappy(1)\r
isHappy(7)\r
isHappy(19)\r
isHappy(2)\r
isHappy(4)\r
isHappy(116)\r
\`\`\`\r
\r
**\`do\`-\`while\` and not \`while\`, because they start together.** Both begin at \`n\`,\r
so a \`while (slow != fast)\` loop would find them equal before either has moved\r
and stop immediately. The body has to run once before the test.\r
\r
**Nothing is stored.** Two \`int\`s chase each other through a chain that may be\r
thousands of numbers long, and the memory does not move — which is the whole\r
reason this technique exists and why it comes back on every linked-list problem.\r
\r
![Slow and fast walking the chain from 2 until they land on the same number](diagrams/happy-number-notes-floyd.jpg)\r
\r
## Why every unhappy number reaches 4\r
\r
The chains are not arbitrary. Squaring digits cannot make a number grow for\r
long: 999 gives 243, and no three-digit number can produce more than that, so\r
everything above 243 comes down and stays down. Inside that small range the\r
chain has nowhere to go, and every start that is not happy walks into the same\r
eight-number ring.\r
\r
![The happy chain from 19 reaching 1, and the unhappy chain from 2 falling into the ring](diagrams/happy-number-notes-chains.jpg)\r
\r
That is why approach 1 can test one number instead of a set: 4 is on the ring,\r
so an unhappy chain is guaranteed to stand on it sooner or later.\r
\r
## What the three cost\r
\r
**Time is the yellow line, memory the green one.** All three walk the same chain,\r
so all three take the same time; the difference is entirely in what they keep.\r
\r
![Time and memory for all three versions on one pair of axes](diagrams/happy-number-notes-cost.jpg)\r
\r
The chain from \`n\` shortens the number to three digits almost immediately and\r
then wanders inside a fixed set, so the work is "read the digits" — O(log n) —\r
repeated a bounded number of times.\r
\r
| Approach | Time | Space | |\r
|---|---|---|---|\r
| 1 — stop at 4 | O(log n) | O(1) | fastest, and rests on a fact it does not show |\r
| 2 — remember what you have seen | O(log n) | O(log n) — the set | **the one to know first** |\r
| 3 — Floyd | O(log n) | O(1) | the technique, borrowed from linked lists |\r
`;export{e as default};