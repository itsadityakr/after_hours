var e=`Read one, close the page, go back to the editor. They are in order and they stop
before the answer.

## Before any hint at all

Write down what your method should return for these four: \`(2.0, 0)\`,
\`(2.0, 10)\`, \`(2.0, -2)\` and \`(2.0, -2147483648)\`. Three of them are easy. The
fourth is the problem, and if you cannot say what makes it different from the
third then that is where to start.

## 1. Get the sign out of the way first

\`x⁻³\` is \`1 / x³\`. That gives you a choice about *where* to divide: once on \`x\`
before the loop, or once on the answer after it.

Pick one and commit to it, so that the body of your loop never has to know
whether the exponent was negative. A loop with a sign test inside it is a loop
you will get wrong.

## 2. The exponent you flipped may not exist

You have almost certainly written something like "if \`n\` is negative, make it
positive". Take the smallest \`int\` — \`−2147483648\` — and work out by hand what
the positive version of it is.

Then look up \`Integer.MAX_VALUE\` and compare. One of these two numbers is not
representable, and your code is currently pretending it is.

The fix is one word on one line, and it is a type. Nothing else changes.

## 3. Check what your loop does when the flip failed

Suppose the negation silently gave you back a negative number. Read your loop
condition with that value in it.

Does it throw? Does it hang? Does it return something wrong? The answer is the
third one, and *that* is why this input is worth being paranoid about — there
is nothing at run time to tell you it happened.

## 4. Now count the multiplications

Your loop multiplies once per unit of the exponent. Write down how many times
that is for \`n = 2147483648\`.

Compare it against the rough budget for a submission — a few hundred million
simple operations. You are not close, and no amount of tidying the loop body
will get you there.

## 5. Stop building every power on the way

To reach \`x¹⁰\` your loop computes \`x¹\`, \`x²\`, \`x³\` … one at a time. Write that
list out.

Now write out a different list: start at \`x\` and **square** each time. Four
entries in, where have you got to? Six entries in?

One list adds one to the exponent per step, the other doubles it. That is the
whole idea, and everything left is bookkeeping.

## 6. But 10 is not a power of two

Squaring gives you \`x¹\`, \`x²\`, \`x⁴\`, \`x⁸\`, \`x¹⁶\` and nothing in between — so you
have to build \`x¹⁰\` out of those.

Which two of them multiply together to give \`x¹⁰\`? Now try \`x¹¹\`, and \`x¹³\`.
Write 10, 11 and 13 in binary and put the two lists side by side. The rule you
are looking for is visible from there.

## 7. Reading the exponent one bit at a time

You need to walk the exponent's binary digits, and you do not need a bit library
for it. Ask what \`power / 2\` does to the binary form of a number, and what
\`power % 2\` tells you about it.

That is your loop: one test, one climb, one halving. Say out loud what each of
your three variables holds at the top of the body — one of them is the running
answer, one is the current rung, one is what is left of the exponent.

## 8. One line runs one time too many

After the loop ends, look at the last thing your \`x\` was assigned. Is it ever
read?

It is not — and it can overflow to infinity or shrink to zero on the way. Decide
whether that matters before you go adding a guard for it.

## 9. Now run your four inputs

\`(2.0, 0)\`, \`(2.0, 10)\`, \`(2.0, -2)\`, \`(2.0, -2147483648)\`. If the last one comes
back as \`1.0\` instantly, go back to hint 2 — nothing else produces that symptom.

## 10. If none of that was enough

The overflow walked through step by step, the squaring ladder drawn out, why
\`x¹⁰\` is \`x⁸ · x²\`, and what the recursive form costs instead are on the
**Notes** tab.
`;export{e as default};