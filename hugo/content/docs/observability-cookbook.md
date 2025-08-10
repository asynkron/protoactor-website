---
title: "Observability Cookbook"
date: 2025-08-09
draft: false
tags: [observability, guides]
---

# Observability Cookbook

Distributed debugging requires end-to-end visibility. This page links tracing, metrics, and logging into actionable steps.

## Structured logs

Include correlation IDs to link logs to traces.

```csharp
log.LogInformation("{CorrelationId} handling {Message}", id, msg);
```

## Metrics to watch

- Mailbox depth per actor
- Message processing latency
- Restart counts and deadletters

## Sample dashboard

```mermaid
graph LR
    subgraph Metrics
        m1[Mailbox depth]
        m2[Processing latency]
    end
    subgraph Logs
        l1[Correlation ID]
    end
    subgraph Traces
        t1[Spans per PID]
    end
    m1-->l1
    m2-->t1
```

Start with these building blocks and iterate: good observability turns incidents into quick fixes rather than mysteries.
