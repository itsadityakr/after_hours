var e=`The definition gives you a program in six lines and it is far too slow. These
hints go to the trial-division version first, then take it apart, because the
idea that replaces it only makes sense once you can say exactly what is wrong
with it.

## Before any hint at all

What is \`countPrimes(2)\`? And \`countPrimes(3)\`, \`countPrimes(0)\`,
\`countPrimes(1)\`?

Three of those four are answered by one word in the problem statement. Find the
word. It is the difference between a passing submission and an off-by-one you
will not spot in your own testing.

## 1. Write the test for one number

Say what it means for \`k\` to be prime, then write the loop that checks it.

Start with the honest version — every divisor from 2 up to \`k - 1\`. Do not
optimise it yet. Get it right on 1, 2, 3 and 4 first; two of those are below where
the loop even starts.

## 2. Stop early, and be able to prove it

You do not need to try every divisor up to \`k\`. There is a point past which no new
divisor can exist.

Find it by writing the divisors of 36 as products: \`1 × 36\`, \`2 × 18\`, \`3 × 12\`,
and so on. Look at the two columns and say where they cross.

Then prove it: if \`k = a × b\` and both \`a\` and \`b\` were above that crossing point,
what would \`a × b\` be? Say that sentence out loud — it is what an interviewer is
actually asking for when they ask why the square root.

## 3. Write the bound without a square root

There are two ways to say "stop at the square root": one calls a library function,
one uses a multiplication.

One is exact and one is floating point. Decide which you want deciding a loop
bound, and think about what happens at a \`k\` that *is* a perfect square. Then
check the type of the multiplication — \`k\` goes to five million, so square its
divisor bound and see whether that still fits where you put it.

## 4. Now count what it costs

Wrap your test in a loop over the range and add a counter for how many \`%\`
operations happen in total.

Print it for \`n = 1000\`, \`n = 10000\`, \`n = 100000\`. Ten times the input, and the
count goes up by roughly what factor? Say what shape that is.

Then project it to five million and compare against a few hundred million
operations a second.

## 5. Which numbers are expensive?

Look at your counter again, but per number this time. Print the divisions your
test performs for 90, 91, 92, 93, 94, 95, 96, 97.

One of those costs far more than the others. Say which and say why — and then say
what that means as \`n\` grows, given that the expensive kind never runs out.

## 6. The real waste is not inside any one test

Testing 94, your loop divides by 2 and stops. Testing 96, it divides by 2 and
stops. Testing 98, it divides by 2 and stops.

Count how many times, across a run to five million, your program discovers that 2
divides an even number. Write that number down.

Nothing carries from one test to the next. **That**, and not the cost of any
single test, is what has to go.

## 7. Ask the question the other way round

You have been asking each number: *who divides you?*

Ask instead: given 2, *what does 2 divide?* Write the answer as a list. Then given
3. Then 5.

Nothing in that version is ever tested for primality. Say what happens to a number
that never appears in any of those lists, and you have the algorithm.

## 8. What it needs, and what it costs

To do that you need somewhere to record "this one has been crossed off" for every
candidate. Say what shape that is and how big it is for \`n\` at five million. Then
decide whether five megabytes is a price you are allowed to pay here.

Now the running cost. Write the sum: how many multiples of 2 are under \`n\`, plus
how many multiples of 3, plus 5, plus 7. It looks alarming and it is not — it is
barely more than \`n\` itself. You do not need to prove that; you do need to be able
to say it is close to linear and why the terms shrink so fast.

## 9. Two bounds, and both of them are easy to get wrong

First: your outer loop walks candidates and, for each one still standing, crosses
off its multiples. How far does the *outer* loop have to go? Not to \`n\` — and the
reason is hint 2, again.

Second: crossing off the multiples of \`p\`, where should you start? Beginning at
\`2p\` is correct and it repeats work. Every multiple below some point has already
been crossed off by a smaller prime — say what that point is, and say which
smaller prime did the crossing.

## 10. Then check the ends

Run yours against your trial-division version for every \`n\` from 0 to 30. They
must agree on all of them.

If they disagree at 0, 1 or 2, you have found the word from the hint before hint
1. If they disagree at exactly one larger value, look at whether your array is
indexed to \`n - 1\` or to \`n\`, and at which of the two your loop condition assumes.

## 11. The follow-up

Two of the multiples you cross off are pure waste and one of them is huge. Say
what fraction of the array can never be prime past 2, and what the sieve would
look like if you simply did not store those slots.

The other follow-up is about the array not fitting in cache at five million.
Nobody expects the code; they expect you to say the words *one window at a time*
and explain why that changes anything.

## 12. If none of that was enough

The trial-division version with its division counter printed, the run to a hundred
thousand, the cost per number drawn out, and the argument for why turning the
question round is \`n log log n\` are on the **Notes** tab.
`;export{e as default};