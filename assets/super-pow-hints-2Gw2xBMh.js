var e=`The hard part of this one is spotting that the array is not an obstacle. It is
the answer, handed over in the shape the solution wants to read it in.

## Before any hint at all

Answer these two from memory, and write the reason beside each:

\`\`\`text
a^(m + n) = ?          a^(m x n) = ?
\`\`\`

Every line of the final solution is one of those two, so if either was a guess,
settle it now on paper.

## 1. Read the constraints before the statement

\`b.length\` can be 2000. Say what that means about the *value* of \`b\`, in words,
and then say which Java primitive can hold it.

If the answer is "none", then any plan that begins "first convert \`b\` to a
number" is finished. Say so out loud before you write one.

## 2. Write the wrong one anyway

Build the exponent into a \`long\`, then multiply \`a\` by itself that many times,
reducing modulo 1337 each turn. It will pass the sample cases.

Now feed it a twenty-five digit \`b\`. Print the exponent you built beside the
digits you were given. They are not the same number, and nothing told you.

That silence is the point of this hint. Remember what it looks like.

## 3. Two failures, not one

Your method is broken in two independent ways. One is that the exponent is not
the exponent. The other survives even if you switch to a type that could hold it.

Name the second one, with a number attached: how many turns does that loop take
for a 2000-digit exponent?

## 4. Look again at the loop you dismissed

The first loop — the one that assembled the exponent — is one line:

\`\`\`text
e = e * 10 + digit
\`\`\`

That line is a complete description of what a written number *means*. Say in one
sentence what it does to the digits \`1\`, \`2\`, \`3\` in order.

## 5. Now lift it

You do not want \`e\`. You want \`a^e\`.

Take the line from hint 4 and apply \`a^\` to both sides. Using the two identities
from the warm-up, rewrite \`a^(e x 10 + digit)\` so that the only exponents left in
it are \`10\` and \`digit\`.

If you get there, you have solved the problem. What is left is typing.

## 6. Two bases, one line

The expression you just wrote has two powers being multiplied. They do **not**
have the same base.

Write down which one is built on the running answer and which is built on the
original \`a\`. Then say what goes wrong if you use \`a\` for both — and check that
prediction against \`b = [1, 1]\` by hand.

## 7. The small power

You now need a helper that raises something to a power. Look at the two exponents
it will ever be given.

Given that, decide whether it is worth writing fast exponentiation here. Have a
one-sentence answer ready either way; that question gets asked.

Also decide where in the helper the base gets reduced modulo 1337, and why it has
to be before the first multiplication rather than after it.

## 8. Prove the arithmetic never overflows

You are reducing modulo 1337 after every multiplication. So write down the
largest value either factor can have, multiply the two, and compare against
\`Integer.MAX_VALUE\`.

Then answer the follow-up: at what modulus would this argument stop working, and
what would you change?

## 9. The theorem that does not apply

Somebody will suggest reducing \`b\` modulo φ(1337) and exponentiating that.

Factorise 1337. Then state the condition Euler's theorem attaches, and find a
legal value of \`a\` in this problem that fails it. Being able to say why the
shortcut is unsafe here is worth more than the shortcut.

## 10. Test the four that matter

\`b = [0]\`, \`b = [1, 0]\`, \`a = 1337\`, \`a = 2147483647\`.

Say what each one is checking before you run it. Then check the whole thing
against your loop from hint 2 for every exponent from 0 to 500 — the digit walk
and the repeated multiplication must agree everywhere the second one is still
honest.

## 11. If none of that was enough

The identity derived in full, the digit fold drawn, both dry runs, the overflow
argument with a number on it, and why Euler's theorem is off the table are on the
**Notes** tab.
`;export{e as default};