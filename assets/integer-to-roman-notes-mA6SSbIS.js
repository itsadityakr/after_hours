var e=`Roman numerals look like a nest of special cases — \`IV\` and \`IX\` and \`XL\` are\r
not \`I\` before \`V\`, they are their own symbols. Stop treating them as\r
exceptions, put all thirteen values in one table, and the whole problem collapses\r
into a greedy loop that fits in ten lines.\r
\r
## 1. The problem\r
\r
Given an integer, write it as a Roman numeral.\r
\r
- **In** — \`num\`, an \`int\`, with \`1 <= num <= 3999\`.\r
- **Out** — the numeral, as a \`String\`.\r
\r
The seven symbols:\r
\r
\`\`\`text\r
I = 1     V = 5     X = 10     L = 50     C = 100     D = 500     M = 1000\r
\`\`\`\r
\r
The rule everybody knows is that you write the largest symbols first and add\r
them up — \`XVI\` is \`10 + 5 + 1\`. The rule that causes the trouble is the other\r
one: **a smaller symbol immediately before a larger one is subtracted.**\r
\r
Six pairs, and only six, are allowed to do that:\r
\r
\`\`\`text\r
IV = 4      IX = 9\r
XL = 40     XC = 90\r
CD = 400    CM = 900\r
\`\`\`\r
\r
\`\`\`text\r
intToRoman(3)     -> "III"\r
intToRoman(4)     -> "IV"\r
intToRoman(9)     -> "IX"\r
intToRoman(58)    -> "LVIII"        50 + 5 + 1 + 1 + 1\r
intToRoman(1994)  -> "MCMXCIV"      1000 + 900 + 90 + 4\r
intToRoman(3749)  -> "MMMDCCXLIX"\r
\`\`\`\r
\r
Three things worth pinning down before writing any code.\r
\r
**The upper bound is doing real work.** 3999 is the largest number the system\r
can write, because there is no symbol for 5000 and \`MMMM\` is not allowed. So the\r
answer is at most fifteen characters and the loop can never run away.\r
\r
**Only six subtractive pairs exist.** Not "any smaller before any larger" —\r
\`IL\` is not 49 and \`IC\` is not 99. That finite list is the reason the table\r
below can be finite.\r
\r
**Greedy is not merely a good idea here, it is provably correct.** With this\r
particular set of values there is never a case where taking the largest symbol\r
that fits leads to a worse answer later. That is a property of the numeral\r
system, not of the algorithm, and it is what the whole solution rests on.\r
\r
## 2. The brute force\r
\r
The obvious first attempt treats the subtractive pairs as **exceptions**: handle\r
the seven ordinary symbols, and special-case the six awkward ones as you go.\r
\r
\`\`\`java RomanCases.java @run-integer-to-roman-roman-cases
static String intToRoman(int num) {\r
\r
    StringBuilder result = new StringBuilder();\r
\r
    while (num > 0) {\r
        if (num >= 1000)      { result.append("M");  num -= 1000; }\r
        else if (num >= 900)  { result.append("CM"); num -= 900;  }\r
        else if (num >= 500)  { result.append("D");  num -= 500;  }\r
        else if (num >= 400)  { result.append("CD"); num -= 400;  }\r
        else if (num >= 100)  { result.append("C");  num -= 100;  }\r
        else if (num >= 90)   { result.append("XC"); num -= 90;   }\r
        else if (num >= 50)   { result.append("L");  num -= 50;   }\r
        else if (num >= 40)   { result.append("XL"); num -= 40;   }\r
        else if (num >= 10)   { result.append("X");  num -= 10;   }\r
        else if (num >= 9)    { result.append("IX"); num -= 9;    }\r
        else if (num >= 5)    { result.append("V");  num -= 5;    }\r
        else if (num >= 4)    { result.append("IV"); num -= 4;    }\r
        else                  { result.append("I");  num -= 1;    }\r
    }\r
\r
    return result.toString();\r
}\r
\`\`\`

\`\`\`output @run-integer-to-roman-roman-cases
intToRoman(3)    -> III
intToRoman(4)    -> IV
intToRoman(9)    -> IX
intToRoman(58)   -> LVIII
intToRoman(1994) -> MCMXCIV
intToRoman(3749) -> MMMDCCXLIX
intToRoman(3999) -> MMMCMXCIX
\`\`\`\r
\r
\`\`\`demo RomanCases.java\r
intToRoman(3)\r
intToRoman(4)\r
intToRoman(9)\r
intToRoman(58)\r
intToRoman(1994)\r
intToRoman(3749)\r
intToRoman(3999)\r
\`\`\`\r
\r
It is correct. Every answer above is right, and it will pass.\r
\r
## 3. Dry run of the brute force\r
\r
\`num = 1994\`.\r
\r
| Turn | \`num\` | First branch that fits | Appended | Result so far |\r
| --- | --- | --- | --- | --- |\r
| 1 | 1994 | \`>= 1000\` | \`M\` | \`M\` |\r
| 2 | 994 | \`>= 900\` | \`CM\` | \`MCM\` |\r
| 3 | 94 | \`>= 90\` | \`XC\` | \`MCMXC\` |\r
| 4 | 4 | \`>= 4\` | \`IV\` | \`MCMXCIV\` |\r
| 5 | 0 | — loop ends | | \`MCMXCIV\` |\r
\r
Four turns, four symbols. Nothing about the *behaviour* is wrong.\r
\r
## 4. Why it is not enough\r
\r
The complexity is fine — the loop runs at most fifteen times, because that is\r
the longest numeral in range. The problem is the **shape**.\r
\r
Read the thirteen branches again. They are not thirteen different decisions:\r
they are the *same* decision thirteen times, with two numbers changed. Every\r
line asks "does this value fit, and if so what do I append and subtract".\r
\r
That has three consequences, and they are the reason this gets rewritten:\r
\r
- **The order is load-bearing and invisible.** Move the \`>= 500\` line above the\r
  \`>= 900\` line and 900 comes out as \`DCD\`. Nothing in the code says the\r
  branches are sorted, so nothing stops somebody sorting them differently.\r
- **A value and its symbol are written in two places** — the number in the\r
  condition, the string in the body — with nothing tying them together. Get one\r
  pair out of step and the bug is silent.\r
- **It cannot be reused.** Adding a symbol means adding a branch in exactly the\r
  right place.\r
\r
The fix is not a better algorithm. The greedy loop is already the right\r
algorithm. The fix is to notice that **thirteen branches asking the same\r
question are a table**, and that the subtractive pairs were never exceptions at\r
all — \`CM\` is simply a symbol whose value happens to be 900.\r
\r
## 5. The plan, in pseudocode\r
\r
\`\`\`pseudo\r
values  = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]\r
symbols = [ "M","CM", "D","CD", "C","XC","L","XL","X","IX","V","IV","I"]\r
\r
result = empty text\r
\r
for i from 0 to 12:\r
    while num >= values[i]:\r
        append symbols[i] to result\r
        num = num - values[i]\r
\r
return result\r
\`\`\`\r
\r
Two loops, and each one has a job worth naming.\r
\r
- The **\`for\`** walks the table from the largest value down. Because it only\r
  ever moves forward, a value that no longer fits is never revisited.\r
- The **\`while\`** repeats one symbol while it still fits. That is what turns\r
  3000 into \`MMM\` without three entries for it.\r
\r
## 6. The table\r
\r
\`\`\`java Roman.java @run-integer-to-roman-roman
static String intToRoman(int num) {\r
\r
    int[] values = {\r
        1000, 900, 500, 400,\r
        100, 90, 50, 40,\r
        10, 9, 5, 4, 1\r
    };\r
\r
    String[] symbols = {\r
        "M", "CM", "D", "CD",\r
        "C", "XC", "L", "XL",\r
        "X", "IX", "V", "IV", "I"\r
    };\r
\r
    StringBuilder result = new StringBuilder();\r
\r
    for (int i = 0; i < values.length; i++) {\r
\r
        while (num >= values[i]) {\r
            result.append(symbols[i]);\r
            num = num - values[i];\r
        }\r
    }\r
\r
    return result.toString();\r
}\r
\`\`\`

\`\`\`output @run-integer-to-roman-roman
intToRoman(1)    -> I
intToRoman(4)    -> IV
intToRoman(9)    -> IX
intToRoman(14)   -> XIV
intToRoman(40)   -> XL
intToRoman(58)   -> LVIII
intToRoman(400)  -> CD
intToRoman(1994) -> MCMXCIV
intToRoman(3749) -> MMMDCCXLIX
intToRoman(3999) -> MMMCMXCIX
\`\`\`\r
\r
\`\`\`demo Roman.java\r
intToRoman(1)\r
intToRoman(4)\r
intToRoman(9)\r
intToRoman(14)\r
intToRoman(40)\r
intToRoman(58)\r
intToRoman(400)\r
intToRoman(1994)\r
intToRoman(3749)\r
intToRoman(3999)\r
\`\`\`\r
\r
Four things that are now true and were not before.\r
\r
**The two arrays are one table, and the pairing is positional.** \`values[i]\` and\r
\`symbols[i]\` belong together, and the layout — four per line, in matching\r
groups — is the only thing keeping them readable. Nothing enforces it, which is\r
the one genuine weakness of this shape; a small \`record\` per row would.\r
\r
**Descending order is the whole algorithm.** The \`for\` never goes backwards, so\r
"take the biggest that fits, then never look at it again" is expressed by the\r
loop itself rather than by thirteen \`else\`s.\r
\r
**The subtractive pairs stopped being special.** \`CM\` sits between \`M\` and \`D\`\r
because 900 sits between 1000 and 500. That is the entire trick of the problem,\r
and it is why \`while (num >= values[i])\` needs no exception for it: \`num\` can\r
never be 900 or more twice in a row, so the inner loop simply runs once and\r
moves on.\r
\r
**\`StringBuilder\`, not \`String\`.** Appending to a \`String\` builds a new one each\r
time — at most fifteen here, so it would not actually matter, but it is the\r
habit the harder string problems need.\r
\r
### Complexity\r
\r
- **Time** — O(1). The table has thirteen entries and the answer is at most\r
  fifteen characters, both fixed by the \`num <= 3999\` bound. Written as a\r
  function of the input it is O(log n), because the numeral's length grows with\r
  the number of digits.\r
- **Space** — O(1) beyond the output, which is at most fifteen characters.\r
\r
## 7. Dry run of the table version\r
\r
\`num = 3749\`. The \`i\` column is the table index; blank rows are values that\r
never fit and are skipped instantly.\r
\r
| \`i\` | \`values[i]\` | \`num\` before | Fits? | Appended | \`num\` after |\r
| --- | --- | --- | --- | --- | --- |\r
| 0 | 1000 | 3749 | yes | \`M\` | 2749 |\r
| 0 | 1000 | 2749 | yes | \`M\` | 1749 |\r
| 0 | 1000 | 1749 | yes | \`M\` | 749 |\r
| 0 | 1000 | 749 | no | — | 749 |\r
| 1 | 900 | 749 | no | — | 749 |\r
| 2 | 500 | 749 | yes | \`D\` | 249 |\r
| 2 | 500 | 249 | no | — | 249 |\r
| 3 | 400 | 249 | no | — | 249 |\r
| 4 | 100 | 249 | yes | \`C\` | 149 |\r
| 4 | 100 | 149 | yes | \`C\` | 49 |\r
| 4 | 100 | 49 | no | — | 49 |\r
| 5 | 90 | 49 | no | — | 49 |\r
| 6 | 50 | 49 | no | — | 49 |\r
| 7 | 40 | 49 | yes | \`XL\` | 9 |\r
| 7 | 40 | 9 | no | — | 9 |\r
| 8 | 10 | 9 | no | — | 9 |\r
| 9 | 9 | 9 | yes | \`IX\` | 0 |\r
| 10–12 | 5, 4, 1 | 0 | no | — | 0 |\r
\r
Result: \`MMM\` + \`D\` + \`CC\` + \`XL\` + \`IX\` = **\`MMMDCCXLIX\`**.\r
\r
Two things to read off that table.\r
\r
The inner \`while\` fired three times at \`i = 0\` and twice at \`i = 4\` — that is\r
where repeated symbols come from, and it is the only place they can.\r
\r
And every subtractive pair that appeared — \`XL\`, \`IX\` — came out of a single\r
turn of the inner loop, because 40 and 9 cannot each be taken twice. That is not\r
a coincidence and it is not enforced by code: it follows from where those values\r
sit in the table.\r
\r
## 8. Key takeaways\r
\r
- **Thirteen branches asking the same question are a table.** The rewrite here\r
  changed no behaviour and no complexity — it changed a chain of conditions into\r
  data, and that is the whole point of the problem.\r
- **The subtractive pairs are not exceptions.** Give \`CM\` a value of 900 and put\r
  it in descending order, and it is an ordinary symbol. Every "special case" in\r
  this problem dissolves the moment you stop calling it one.\r
- **Greedy works here because of the numeral system**, not because greedy\r
  usually works. Taking the largest value that fits is safe with *these* values;\r
  it is not safe in general — the same approach on a coin system of 1, 3 and 4\r
  gives 6 as 4 + 1 + 1 rather than 3 + 3.\r
- **Descending order is a precondition, and nothing checks it.** That is the one\r
  thing to be careful of when adding a row.\r
- **The bound is doing work.** \`num <= 3999\` is what makes the answer a fixed\r
  size and the complexity constant. Without it you would need a rule for\r
  thousands and the table would have to grow.\r
- The same table, read the other way, solves [Roman to Integer](problem:roman-to-integer)\r
  — which is the reason it is worth writing down properly once.\r
`;export{e as default};