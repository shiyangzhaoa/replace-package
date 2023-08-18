## replace-package

<p>
  <img src="./logo.svg" alt="replace-package">
</p>

from:

```tsx
import classnames from 'classnames';

const Component = ({ active }) => {
  return (
    <div className={classnames({ ['text-black']: active })}>orz</div>
  );
};
```

to:

```tsx
import clsx from 'clsx';

const Component = ({ active }) => {
  return (
    <div className={clsx({ ['text-black']: active })}>orz</div>
  );
};
```

### How to use

step 1: init

```shell
npx replace-package@latest init
```

codemod.json

```json
{
  "replace-package": {
    "name": "",
    "source": "",
    "importDefault": false,
    "legacyName": "",
    "legacySource: "",
    "legacyImportDefault": false,
  }
}
```

change config

```json
{
  "replace-package": {
    "name": "clsx",
    "source": "clsx",
    "importDefault": true,
    "legacyName": "classnames",
    "legacySource: "classnames",
    "legacyImportDefault": true,
  }
}
```

try

```shell
npx replace-package@latest src/**/*.tsx
```

> It will check your git directory is clean, you can use '--force' to skip the check.

### Example

#### component

codemod.json

```json
{
  "replace-package": {
    "name": "Form",
    "source": "@ant-design/compatible",
    "importDefault": false,
    "legacyName": "Form",
    "legacySource: "antd",
    "legacyImportDefault": false,
  }
}
```

by path(VSCode copy path)

```json
{
  "replace-package": {
    "name": "Form",
    "source": "/Users/xx/workspace/xx/src/components/Form",
    "importDefault": false,
    "legacyName": "Form",
    "legacySource: "antd",
    "legacyImportDefault": false,
  }
}
```

#### utils

codemod.json

```json
{
  "replace-package": {
    "name": "clsx",
    "source": "clsx",
    "importDefault": true,
    "legacyName": "classnames",
    "legacySource: "classnames",
    "legacyImportDefault": true,
  }
}
```

or

```json
{
  "replace-package": {
    "name": "clsx",
    "source": "clsx",
    "importDefault": true,
    "legacyName": "classnames",
    "legacySource: "/Users/xx/workspace/xx/src/utils/classnames",
    "legacyImportDefault": true,
  }
}
```

#### name import

legacy

```tsx
import { Form as NewForm, Select, Input, DatePicker } from 'antd';
import { Form } from '@ant-design/compatible';

//...
<Form layout="horizontal"></Form>
```

codemod.json

```json
{
  "replace-package": {
    "legacyName": "Form",
    "legacySource": "@ant-design/compatible",
    "legacyImportDefault": false,
    "name": "Form",
    "source": "antd",
    "importDefault": false
  }
}
```

transformed

```tsx
import { Form as NewForm, Select, Input, DatePicker } from 'antd';

//...
<NewForm layout="horizontal"></NewForm>
```
