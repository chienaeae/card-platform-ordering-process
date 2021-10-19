describe('Utils test suite', () => {
    beforeEach(() => {
        console.log('before each');
    })

    beforeAll(() => {
        console.log('before all');
    })

    test('first test', () => {
        const test = 'Hello World'
        expect(test).toBe('Hello World')
    });
});