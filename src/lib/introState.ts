export const introState = {
  scale: 0,
  open: 1,
  spin: 0,
  shake: 0,
};

export function resetIntro() {
  introState.scale = 0;
  introState.open = 1;
  introState.spin = 0;
  introState.shake = 0;
}