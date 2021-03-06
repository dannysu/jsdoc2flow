"use strict"

const { isCodeEqual } = require("./helper")

const Converter = require("../src")
const converter = new Converter()

describe("paramFixer", function () {
  describe("simple name and no type info", function () {
    it("should work", function () {
      const code = `
            /**
             * @param a
             */
            function test(a) {
            }
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `
            /**
             * @param a
             */
            function test(a) {
            }
            `
      )
    })
  })

  describe("object type should turn into {}", function () {
    it("should work", function () {
      const code = `
            /**
             * @param {object} obj
             */
            function test(obj) {
            }
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `
            /**
             * @param {object} obj
             */
            function test(obj : {  }) {
            }
            `
      )
    })
  })

  describe("simple name by itself and nothing else", function () {
    it("should work", function () {
      const code = `
            /**
             * @param {number} a
             */
            function test(a) {
            }
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `
            /**
             * @param {number} a
             */
            function test(a : number) {
            }
            `
      )
    })
  })

  describe("simple name for function assigned to a variable", function () {
    it("should work", function () {
      const code = `
            /**
             * @param {number} a
             */
            Something.prototype.test = function(a) {
            }
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `
            /**
             * @param {number} a
             */
            Something.prototype.test = function(a : number) {
            }
            `
      )
    })
  })

  describe("simple name for function assigned in variable declaration", function () {
    it("should work", function () {
      const code = `
            /**
             * @param {number} a
             */
            const test = function(a) {
            }
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `
            /**
             * @param {number} a
             */
            const test = function(a : number) {
            }
            `
      )
    })
  })

  describe("simple name for FunctionExpression within an object", function () {
    it("should work", function () {
      const code = `
            const obj = {
                /**
                 * @param {number} a
                 */
                foo: function(a) {
                }
            };
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `
            const obj = {
                /**
                 * @param {number} a
                 */
                foo: function(a : number) {
                }
            };
            `
      )
    })
  })

  describe("simple name for arrow function with brackets", function () {
    it("should work", function () {
      const code = `
            /**
             * @param {number} a
             */
            const test = (a) => {
            };
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `
            /**
             * @param {number} a
             */
            const test = (a : number) => {
            };
            `
      )
    })
  })

  describe("arrow function with destructuring assigned to var", function () {
    it("should work", function () {
      const code = `
            /**
             * @param {object} obj
             * @param {number} obj.a
             * @param {number} obj.b
             */
            e.test = ({ a, b }) => {
            };
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `
            /**
             * @param {object} obj
             * @param {number} obj.a
             * @param {number} obj.b
             */
            e.test = ({ a, b } : { a: number, b: number }) => {
            };
            `
      )
    })
  })

  describe("simple name for arrow function without brackets", function () {
    it("should work", function () {
      const code = `
            /**
             * @param {number} a
             */
            const test = a => {
            };
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `
            /**
             * @param {number} a
             */
            const test = (a : number) => {
            };
            `
      )
    })
  })

  describe("simple name for function in a ES6 class", function () {
    it("should work", function () {
      const code = `
            class Test {
                /**
                 * @param {number} a
                 */
                test(a) {
                }
            }
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `
            class Test {
                /**
                 * @param {number} a
                 */
                test(a : number) {
                }
            }
            `
      )
    })
  })

  describe("object property with default value", function () {
    it("should not put ? in front of the type", function () {
      const code = `
            /**
             * @param {object} obj
             * @param {number=} obj.a
             */
            function test({ a = 1 }) {
            }
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `
            /**
             * @param {object} obj
             * @param {number=} obj.a
             */
            function test({ a = 1 } : { a?: number } ) {
            }
            `
      )
    })
  })

  describe("simple name with default value", function () {
    it("should just ignore the default value", function () {
      const code = `
            /**
             * @param {number} [a=1]
             */
            function test(a) {
            }
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `
            /**
             * @param {number} [a=1]
             */
            function test(a : number) {
            }
            `
      )
    })
  })

  describe("simple optional name variation 1", function () {
    it("should work", function () {
      const code = `
            /**
             * @param {number=} a
             */
            function test(a) {
            }
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `
            /**
             * @param {number=} a
             */
            function test(a: ?number) {
            }
            `
      )
    })
  })

  describe("simple optional name variation 2", function () {
    it("uses comment-parser instead of doctrine", function () {
      const code = `
            /**
             * @param {number} [a]
             */
            function test(a) {
            }
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `
            /**
             * @param {number} [a]
             */
            function test(a: number) {
            }
            `
      )
    })
  })

  describe("simple name of any type", function () {
    it("should convert * to any", function () {
      const code = `
            /**
             * @param {*} a
             */
            function test(a) {
            }
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `
            /**
             * @param {*} a
             */
            function test(a : any) {
            }
            `
      )
    })
  })

  describe("simple name of union type", function () {
    it("should work", function () {
      const code = `
            /**
             * @param {number|boolean} a
             */
            function test(a) {
            }
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `
            /**
             * @param {number|boolean} a
             */
            function test(a: number | boolean) {
            }
            `
      )
    })
  })

  describe("name within an assignment pattern", function () {
    it("should work", function () {
      const code = `
            /**
             * @param {number} a
             */
            function test(a = 1) {
            }
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `
            /**
             * @param {number} a
             */
            function test(a : number = 1) {
            }
            `
      )
    })
  })

  describe("name within an object pattern", function () {
    it("should work", function () {
      const code = `
            /**
             * @param {object} obj
             * @param {number} obj.a
             */
            function test({ a }) {
            }
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `
            /**
             * @param {object} obj
             * @param {number} obj.a
             */
            function test({ a } : { a: number } ) {
            }
            `
      )
    })

    it("should work", function () {
      const code = `
            /**
             * @param {object} obj
             * @param {number=} obj.a
             */
            function test({ a }) {
            }
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `
            /**
             * @param {object} obj
             * @param {number=} obj.a
             */
            function test({ a } : { a?: ?number } ) {
            }
            `
      )
    })

    it("should work", function () {
      const code = `
            /**
             * @param {object} obj
             * @param {number} obj.a
             */
            function test({ a } = {a: 1}) {
            }
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `
            /**
             * @param {object} obj
             * @param {number} obj.a
             */
            function test({ a } : { a: number } = {a: 1}) {
            }
            `
      )
    })
  })

  describe("define object without object pattern", function () {
    it("should work", function () {
      const code = `
            /**
             * @param {number} a
             * @param {object} obj
             * @param {number} obj.c
             * @param {object} obj.d
             * @param {number} obj.d.e
             * @param {string} f
             */
            function test(a, obj, f) {
            }
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `
            /**
             * @param {number} a
             * @param {object} obj
             * @param {number} obj.c
             * @param {object} obj.d
             * @param {number} obj.d.e
             * @param {string} f
             */
            function test(a : number, obj : { c: number, d: { e: number } } , f : string ) {
            }
            `
      )
    })
  })

  describe("define object in object pattern with optional properties", function () {
    it("should work", function () {
      const code = `
            /**
             * @param {number} a
             * @param {object} obj
             * @param {number=} obj.c
             * @param {object=} obj.d
             * @param {number=} obj.d.e
             * @param {string} f
             */
            function test(a, obj, f) {
            }
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `
            /**
             * @param {number} a
             * @param {object} obj
             * @param {number=} obj.c
             * @param {object=} obj.d
             * @param {number=} obj.d.e
             * @param {string} f
             */
            function test(a : number, obj : { c?: ?number, d?: { e?: ?number } } , f : string ) {
            }
            `
      )
    })
  })

  describe("multiple object patterns", function () {
    it("should work", function () {
      const code = `
            /**
             * @param {number} a
             * @param {object} obj1
             * @param {number} obj1.b
             * @param {object} obj2
             * @param {number} obj2.c
             * @param {object} obj2.d
             * @param {number} obj2.d.e
             */
            function test(a, { b }, { c, d: { e } }) {
            }
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `
            /**
             * @param {number} a
             * @param {object} obj1
             * @param {number} obj1.b
             * @param {object} obj2
             * @param {number} obj2.c
             * @param {object} obj2.d
             * @param {number} obj2.d.e
             */
            function test(a : number, { b } : { b: number } , { c, d: { e } } : { c: number, d: { e: number } } ) {
            }
            `
      )
    })
  })

  describe("name within an assignment pattern, which is within an object pattern", function () {
    it("should work", function () {
      const code = `
            /**
             * @param {object} obj
             * @param {number} obj.a
             */
            function test({ a = 1 }) {
            }
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `
            /**
             * @param {object} obj
             * @param {number} obj.a
             */
            function test({ a = 1 } : { a: number } ) {
            }
            `
      )
    })
  })

  describe("name nested object pattern", function () {
    it("should work", function () {
      const code = `
            /**
             * @param {object} obj1
             * @param {object} obj1.a
             * @param {number} obj1.a.b
             */
            function test({ a: { b } }) {
            }
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `
            /**
             * @param {object} obj1
             * @param {object} obj1.a
             * @param {number} obj1.a.b
             */
            function test({ a: { b } } : { a: { b: number } } ) {
            }
            `
      )
    })
  })

  describe("name nested object pattern with assignment pattern", function () {
    it("should work", function () {
      const code = `
            /**
             * @param {object} obj1
             * @param {object} obj1.a
             * @param {number} obj1.a.b
             */
            function test({ a: { b = 1 } }) {
            }
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `
            /**
             * @param {object} obj1
             * @param {object} obj1.a
             * @param {number} obj1.a.b
             */
            function test({ a: { b = 1 } } : { a: { b: number } } ) {
            }
            `
      )
    })
  })

  describe("simple array type", function () {
    it("should work", function () {
      const code = `
            /**
             * @param {number[]} a
             */
            function test(a) {
            }
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `
            /**
             * @param {number[]} a
             */
            function test(a : Array<number> ) {
            }
            `
      )
    })
  })

  describe("object array type", function () {
    it("should work but does not further clarify the object members", function () {
      const code = `
            /**
             * @param {object[]} obj
             * @param {number} obj[].a
             */
            function test(obj) {
            }
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `
            /**
             * @param {object[]} obj
             * @param {number} obj[].a
             */
            function test(obj : Array<{}> ) {
            }
            `
      )
    })
  })

  describe("rest parameters", function () {
    it("should work", function () {
      const code = `
            /**
             * @param {number} theArgs
             */
            function test(...theArgs) {
            }
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `
            /**
             * @param {number} theArgs
             */
            function test(...theArgs : Array<number> ) {
            }
            `
      )
    })
  })

  describe("Function types", function () {
    it("should work", function () {
      const code = `
            /**
             * @param  {function(event:Object):void} callback
             */
            function onDidChange (callback) {
            }
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `
            /**
             * @param  {function(event:Object):void} callback
             */
             function onDidChange (callback: (event:Object) => void) {
             }
            `
      )
    })
  })

  describe("Array Literal types", function () {
    it("should work", function () {
      const code = `
            /**
             * @param  {[elm1]} arg1
             */
            function test (arg1) {
            }
            `
      const modifiedCode = converter.convertSourceCode(code)
      isCodeEqual(
        modifiedCode,
        `
            /**
            * @param  {[elm1]} arg1
             */
             function test (arg1: [elm1]) {
             }
            `
      )
    })
  })
})
