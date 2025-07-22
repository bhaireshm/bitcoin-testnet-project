import { validateAddress } from './validation';
import { TESTNET } from '../config/testnet';

describe('Validation Utilities', () => {
  it('should correctly validate a testnet address', () => {
    const validAddress = 'tb1qbe9w5ws6df4jp2f7fe2spn737vry0vshwspz3g';
    const invalidAddress = 'not_a_real_address';

    expect(validateAddress(validAddress, TESTNET)).toBe(true);
    expect(validateAddress(invalidAddress, TESTNET)).toBe(false);
  });
});
