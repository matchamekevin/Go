// Script de debug pour tester la normalisation des téléphones
const normalizePhone = (raw) => {
  if (!raw) return '';
  let s = raw.replace(/[^0-9+]/g, '');
  if (s.startsWith('00')) s = '+' + s.slice(2);
  if (s.startsWith('+228')) return s;
  if (s.startsWith('228')) return '+' + s;
  if (s.length === 8) return '+228' + s;
  return s;
};

console.log('Tests de normalisation:');
console.log('Input: "+22871234567" -> Output:', normalizePhone('+22871234567'));
console.log('Input: "22871234567" -> Output:', normalizePhone('22871234567'));
console.log('Input: "71234567" -> Output:', normalizePhone('71234567'));

// Test de détection phone vs email
const testValues = ['+22871234567', '22871234567', '71234567', 'test@example.com'];

testValues.forEach(val => {
  const isPhone = /^[\+]?[0-9\-\s\(\)]{8,15}$/.test(val) && !val.includes('@');
  console.log(`"${val}" -> isPhone: ${isPhone}`);
});