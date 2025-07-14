const themes = process.env.THEMES;

function themeDarkness(name) {
  let darkness = "light";
  if (themes.dark.indexOf(name) !== -1) darkness = "dark";

  return darkness;
}

export default themeDarkness;
