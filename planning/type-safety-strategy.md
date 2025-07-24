# Type Safety Strategy

## Philosophy
Maximum compile-time type safety with zero runtime overhead. Think Rust compiler strictness in Python.

## Core Approach

### 1. Compile Everything with mypyc
```
src/
├── compiled/          # 99% of code goes here
│   ├── agents/
│   ├── models/
│   ├── api/
│   └── core/
└── dynamic/          # Only when mypyc breaks
    └── llm_wrappers.py
```

### 2. Type Checking Stack

**Static Analysis** (CI-only):
- **mypy** with strict mode
- **pyright** for second opinion
- Both configured for maximum strictness

**Compilation**:
- **mypyc** compiles all type-annotated code
- Type errors = compilation failures
- 2-10x performance improvement as bonus

## Configuration

### pyproject.toml
```toml
[tool.mypy]
python_version = "3.11"
strict = true
namespace_packages = true
explicit_package_bases = true
check_untyped_defs = true
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
disallow_any_generics = true
no_implicit_optional = true
warn_redundant_casts = true
warn_unused_ignores = true
disallow_any_expr = true
disallow_any_decorated = true
disallow_any_explicit = true
packages = ["ai_dev_team"]

[tool.pyright]
include = ["src"]
typeCheckingMode = "strict"
reportMissingTypeStubs = "error"
reportUnknownParameterType = "error"
reportUnknownVariableType = "error"
reportUnknownMemberType = "error"
reportUnknownArgumentType = "error"
reportUnknownLambdaType = "error"
reportUnknownVariableType = "error"
reportUnknownMemberType = "error"
reportMissingParameterType = "error"
reportUntypedFunctionDecorator = "error"
reportUntypedClassDecorator = "error"
reportUntypedBaseClass = "error"
reportUntypedNamedTuple = "error"

[tool.pytest.ini_options]
# Type checking in tests only - no runtime overhead
addopts = "--typeguard-packages=ai_dev_team"
```

### setup.py
```python
from setuptools import setup, find_packages
from mypyc.build import mypycify

setup(
    name="ai-dev-team",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    ext_modules=mypycify([
        "src/compiled/**/*.py",
    ]),
    package_data={
        "ai_dev_team": ["py.typed"],
    },
)
```

### pyrightconfig.json
```json
{
  "typeCheckingMode": "strict",
  "reportMissingTypeStubs": "error",
  "reportUnknownParameterType": "error",
  "reportUntypedFunctionDecorator": "error",
  "reportUntypedClassDecorator": "error",
  "reportUntypedBaseClass": "error",
  "reportUntypedNamedTuple": "error",
  "reportPrivateUsage": "error",
  "reportConstantRedefinition": "error",
  "reportIncompatibleMethodOverride": "error",
  "reportIncompatibleVariableOverride": "error",
  "reportInconsistentConstructor": "error",
  "reportOverlappingOverload": "error",
  "reportMissingTypeArgument": "error",
  "reportUnnecessaryCast": "error",
  "reportUnnecessaryComparison": "error",
  "reportUnnecessaryIsInstance": "error",
  "reportUnusedVariable": "error",
  "reportUnusedImport": "error"
}
```

## CI Pipeline

### GitHub Actions Workflow
```yaml
name: Type Safety Enforcement
on: [push, pull_request]

jobs:
  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
          
      - name: Install dependencies
        run: |
          pip install -e ".[dev]"
          pip install mypy pyright typeguard pytest-mypy-plugins
          
      - name: Run mypy strict
        run: mypy --strict src/
        
      - name: Run pyright strict  
        run: pyright
        
      - name: Compile with mypyc
        run: python setup.py build_ext --inplace
        
      - name: Run tests with type checking
        run: pytest --typeguard-packages=ai_dev_team
```

## Development Workflow

### Local Development
```bash
# Regular development - interpreted Python
python -m ai_dev_team

# Before committing - compile and verify
./scripts/typecheck.sh  # Runs mypy + pyright
python setup.py build_ext --inplace
pytest
```

### Type Safety Rules

1. **No Any types** - Ever. Use Union, generics, or protocols
2. **All functions typed** - Parameters and returns
3. **Strict None handling** - No implicit Optional
4. **Immutable by default** - Use frozen dataclasses
5. **Final for constants** - Mark things that shouldn't change

### Code Patterns

```python
from typing import Final, Protocol, Never
from dataclasses import dataclass

# Immutable data
@dataclass(frozen=True)
class TicketData:
    id: str
    title: str
    priority: int

# Clear protocols
class TicketProcessor(Protocol):
    def process(self, ticket: TicketData) -> ProcessedResult: ...

# Explicit error handling
def validate_priority(priority: int) -> int:
    if not 1 <= priority <= 5:
        raise ValueError(f"Priority must be 1-5, got {priority}")
    return priority

# Use Never for non-returning functions
def fatal_error(msg: str) -> Never:
    raise SystemExit(msg)
```

## Benefits

1. **Compile-time type checking** - Errors caught before runtime
2. **Performance** - mypyc gives 2-10x speedup
3. **No runtime overhead** - All checking happens in CI
4. **Clean code** - No decorators or runtime validation needed
5. **Confidence** - If it compiles, types are correct

## Exceptions

Only use `src/dynamic/` for:
- Dynamic LLM library calls with heavy `**kwargs`
- Plugin loading with importlib
- Third-party libraries that break under mypyc

Everything else gets compiled and type-checked to the maximum.