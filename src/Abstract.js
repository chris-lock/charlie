// @flow

type AbstractErrorClass = Class<$Subtype<AbstractError>>;

class AbstractError
extends Error {
  constructor(message) {
    super(message);

    this.name = this.constructor.name;
    this.message = message;

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}

class AbstractPropertyError
extends AbstractError {}

class AbstractMethodError
extends AbstractError {}

export default class Abstract {
  static property(abstract: Object, propertyName: string): any {
    if (AbstractProperty.isStatic(abstract)) {
      new AbstractStaticProperty(abstract, propertyName);
    } else {
      new AbstractProperty(abstract, propertyName);
    }
  }

  static method(abstract: Object, methodName: string): any {
    new AbstractMethod(abstract, methodName);
  }
}

class AbstractImplementation {
  static errorClass: AbstractErrorClass;
  static impletemendType: string;

  static isStatic(abstract: Object): boolean {
    return !!abstract.name;
  }

  abstract: Object;
  isStatic: boolean;
  name: string;

  constructor(abstract: Object, name: string) {
    this.abstract = abstract;
    this.isStatic = this.constructor.isStatic(abstract);
    this.name = name;

    this.throwError();
  }

  throwError(): void {
    throw new this.constructor.errorClass(this._message());
  }

  _message(): string {
    return 'Abstract ' +
      `${this._staticOrInstanceImplemenation()} ` +
      `${this._classDeclaration()}` +
      `${this._implementedDeclaration()} ` +
      `must be implemented.`;
  }

  _staticOrInstanceImplemenation(): string {
    var staticOrInstance: string = (this.isStatic)
          ? 'static'
          : 'instance';

    return `${staticOrInstance} ${this.constructor.impletemendType}`;
  }

  _classDeclaration(): string {
    var abstractName: ?string
          = this.abstract.name || (this.abstract.constructor || {}).name;

    return (abstractName)
      ? `${abstractName}.`
      : '';
  }

  _implementedDeclaration(): string {
    var implementedFormat: string = (this.constructor.impletemendType === 'method')
          ? '()'
          : '';

    return `${this.name}${implementedFormat}`;
  }
}

class AbstractProperty
extends AbstractImplementation {
  static errorClass: AbstractErrorClass = AbstractPropertyError;
  static impletemendType: string = 'property';
}

class AbstractStaticProperty
extends AbstractProperty {
  throwError(): void {
    var set: (owner: Object, value: any) => void
          = this.restoreIfNotInitialDeclaration;

    Object.defineProperty(this.abstract, this.name, {
      configurable: true,
      get: super.throwError,
      set: function(value: any) {
        set(this, value);
      },
    });
  }

  restoreIfNotInitialDeclaration(owner: Object, value: any): void {
    if (owner !== this.abstract && typeof value !== 'undefined') {
      Object.defineProperty(owner, this.name, {
        configurable: true,
        enumerable: true,
        value,
        writable: true,
      });
    }
  }
}

class AbstractMethod
extends AbstractImplementation {
  static errorClass: AbstractErrorClass = AbstractMethodError;
  static impletemendType: string = 'method';
}

class Foo {
  static bar: string = Abstract.property(Foo, 'bar');
  bar: string = Abstract.property(this, 'bar');

  baz(): string {
    return Abstract.method(this, 'baz');
  }
}

class Bar
extends Foo {
  static bar: string = 'Bar.bar';
}

class Baz
extends Foo {
  static bar: string = 'Bar.baz';
}

// console.info('Bar.bar', Bar.bar);
// console.info('Baz.bar', Baz.bar);
// console.info('Foo.bar', Foo.bar);
