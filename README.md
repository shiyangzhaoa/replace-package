## replace-package

A tool to replace legacy package

<p>
  <img src="./logo.svg" alt="replace-package">
</p>
<p>
  <a href="https://www.npmjs.com/package/replace-package"><img src="https://img.shields.io/npm/dm/replace-package?style=flat-square" alt="Total Downloads"></a>
  <a href="https://www.npmjs.com/package/replace-package"><img src="https://img.shields.io/bundlephobia/minzip/replace-package?style=flat-square" alt="Latest Release"></a>
  <a href="https://github.com/shiyangzhaoa/replace-package/blob/main/LICENSE"><img src="https://shields.io/github/license/shiyangzhaoa/replace-package?style=flat-square" alt="License"></a>
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
    "legacySource": "",
    "legacyImportDefault": false,
  }
}
```

step 2: change config

```json
{
  "replace-package": {
    "name": "clsx",
    "source": "clsx",
    "importDefault": true,
    "legacyName": "classnames",
    "legacySource": "classnames",
    "legacyImportDefault": true,
  }
}
```

step 3: transform

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
    "legacySource": "antd",
    "legacyImportDefault": false
  }
}
```
<img width="1050" alt="image" src="https://github.com/shiyangzhaoa/replace-package/assets/19943129/5179f436-4827-4978-92f9-8e4a69d4faad">


by path(VSCode copy path)

```json
{
  "replace-package": {
    "name": "Form",
    "source": "/Users/xx/workspace/xx/src/components/Form",
    "importDefault": false,
    "legacyName": "Form",
    "legacySource": "antd",
    "legacyImportDefault": false
  }
}
```
<img width="1145" alt="image" src="https://github.com/shiyangzhaoa/replace-package/assets/19943129/6423aec7-4204-4531-a9af-190936eced3a">
<img width="1197" alt="image" src="https://github.com/shiyangzhaoa/replace-package/assets/19943129/705487df-2591-4d91-8ec9-655073ea94be">


#### utils

codemod.json

```json
{
  "replace-package": {
    "legacyName": "classnames",
    "legacySource": "classnames",
    "legacyImportDefault": true,
    "name": "clsx",
    "source": "clsx",
    "importDefault": true
  }
}
```
<img width="1150" alt="image" src="https://github.com/shiyangzhaoa/replace-package/assets/19943129/d393207b-ef22-416f-9a73-5619cfedf24b">


or

```json
{
  "replace-package": {
    "legacyName": "classnames",
    "legacySource": "/Users/xx/workspace/xx/src/utils/classnames",
    "legacyImportDefault": true,
    "name": "clsx",
    "source": "clsx",
    "importDefault": true
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
