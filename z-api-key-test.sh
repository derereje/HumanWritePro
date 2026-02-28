curl -X POST http://localhost:3050/api/humanizer \
  -H "Authorization: Bearer cb_4a97f74276a9ef00a2360a0cb36bcb546a459c5afb6ef1e00b5d6468814176f7" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "The ability to change and learn is now a vital trait for modern success and the world demands flexible minds that can face rapid shifts in technology and environment and society with calm persistence.  Many people believe that adaptability matters more than intelligence or strength because survival and progress often depend on the speed of response to change.  It has been observed that those who refuse to adapt are often left behind and stagnation sets in which harms future prospects.  Experts claim that people who welcome change find growth and opportunity and develop resilience that supports long term wellbeing.  This quality therefore must be seen as more than a simple skill and it should be treated as a mindset shaping how one views a world full of possibilities.  ",
    "preset": "professional"
  }'