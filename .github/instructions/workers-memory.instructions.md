---
description: "Patterns, best practices, and lessons learned for Python workers in the Baeaubab project."
applyTo: "Queue/worker*/**/*.py"
---

# Workers Memory

Best practices and patterns for Python workers in Baeaubab.

## Always use the Factory pattern for job type dispatch in Python workers

For any worker that handles multiple job types, implement a Factory (or Abstract Factory) to select the correct handler class based on the job type. This avoids large if/elif/switch blocks and makes it easy to add new job types.

**Pattern:**

- Define a base handler interface/class
- Implement one handler class per job type
- Use a factory function/class to return the correct handler
- Call the handler's `handle()` method in the main worker loop

**Example:**

```python
class BaseJobHandler:
    def handle(self, job):
        raise NotImplementedError()

class FactureDetailHandler(BaseJobHandler):
    def handle(self, job):
        # handle facture_detail
        pass

class DefaultHandler(BaseJobHandler):
    def handle(self, job):
        # handle default
        pass

def job_handler_factory(job_type):
    if job_type == "facture_detail":
        return FactureDetailHandler()
    return DefaultHandler()

# Usage in worker main loop
handler = job_handler_factory(job["type"])
handler.handle(job)
```

- Add new job types by creating new handler classes and updating the factory.
- Test handlers independently.
