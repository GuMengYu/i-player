import install from './install';
export default class Player {
  constructor(store) {
    this.howler = { name: 'howler', store };
  }
}

Player.install = install;
