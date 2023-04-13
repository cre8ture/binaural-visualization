# Matter.js + P5.js

Matter.js is an advanced javascript physics engine and p5.js makes it easy for programmers to create games, simulations, graphics, and more.

With this engine, you can now integrate advanced physics into your p5.js projects!

---

## Adding a new body

In this template, you can see how a new rectangle gets created every once in a while and falls to the ground or onto another rectangle.  Each item affected by physics and collisions is known as a **body**.  To add a new body, push a new matter.js body to the `bodies` array like so:

```javascript
bodies.push(Bodies.circle(100, 100, 30));
```

If we take a look at the [documentation](https://brm.io/matter-js/docs/classes/Bodies.html), we can see that the parameters that are for a circle body work like this:

```javascript
Matter.Bodies.circle(x, y, radius, [options], [maxSides]) 
```

That was just a circle, but there are tons more bodies you can try out.  Be sure to take a look at the docs!
https://brm.io/matter-js/docs/classes/Bodies.html

---

And that's basically it!  Enjoy making anything from furious block rain to a fully-functional platformer game.

--
music attributed to artist:
Beirut
Spinnin Tape