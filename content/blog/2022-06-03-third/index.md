+++
title = "Rolling Demo"
description = "A demo of the dice-rolling abilities of this blog."
date = 2022-06-03

[taxonomies]
tags = ["Dice"]

[extra]
highlighted = true
+++


Blah blah blah. You take {{ rollme(die=4, name="damage") }} damage.

I feel like the {{ rollme(die=12) }} is underutilized.

We can roll {{ rollme(die=10, number=3) }} dice.

In _Blades in The Dark_, if you have level three in a skill your roll would be {{ rollme(die=6, number=3, name="blades level three", fn="max") }}. However, if your skill was level zero, then your roll would be {{ rollme(die=6, number=2, name="blades level zero", fn="min") }}.

In some games, you add dice. Let's try {{ rollme(die=8, number=2, fn="sum") }}.

Let's generate a simple table:

{{ rolltable(name="simple table", results=["First", "Second", "Third", "Fourth"]) }}

Here, there's a single result per roll so we use the simplest form. It picks the die automatically based on the number of results, so you can get

{{ rolltable(name="weird table", resultname="Resulting in", results=["A", "Weird", "Table"]) }}

If we want something more complex, then we use:

{{ rollfile(file="@/blog/2022-06-03-third/complexroll.toml") }}

Or:

{{ rollfile(file="@/blog/2022-06-03-third/complexroll2.toml") }}
