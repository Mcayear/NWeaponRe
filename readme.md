## Wiki

[NWeaponRe Wiki](https://github.com/Mcayear/NWeaponRe/wiki)

## 如何编译

安装TypeScript
```
npm install -g typescript
```

从远程仓库中拉取
```
git clone --recurse-submodules https://github.com/Mcayear/NWeaponRe.git
```
> 如果你已经`git clone`且并未附带`--recurse-submodules`，可以使用`git submodule update --init`来拉取子模块

前往目录
```
cd NWeaponRe
```

执行编译
```
npm run comp
```

### 快速构建
你需要先安装打包所需的第三方archiver包，可以直接
```
npm install
```

然后执行构建
```
npm run build
```

构建完成后可以在`./dist/@NWeaponRe.zip`找到压缩包