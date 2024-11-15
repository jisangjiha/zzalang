import Sqids from 'sqids';

const sqids = new Sqids({
  alphabet: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-',
  minLength: 8,
});

export default sqids;
