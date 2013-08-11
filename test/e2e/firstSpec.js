describe('first spec', function() {
    it('should be able to open google homepage', function() {
        var driver = new webdriver.Builder().
            usingServer('http://someHost:1234/wd/hub').
            build();

        driver.get('/googlede');
        driver.findElement(webdriver.By.name('q')).sendKeys('webdriver');
        driver.findElement(webdriver.By.name('btnK')).click();
        driver.sleep(2000);
        driver.getTitle().then(function(title) {
            expect(title).toBe('webdriver - Google-Suche');
        });

        driver.quit();
    });

    // TODO: Use minijasminenode to integrate jasmine with the webdriver.js flows
    var error;
    beforeEach(function() {
        var flow = webdriver.promise.controlFlow();
        flow.on('uncaughtException', function(err) {
            error = err;
        });
    });

    afterEach(function() {
        var done = false,
            flow = webdriver.promise.controlFlow();
        flow.execute(function() {
            done = true;
        });
        waitsFor(function() {
            return done || error;
        });
        runs(function() {
            if (error) {
                throw error;
            }
        });
    });
});


