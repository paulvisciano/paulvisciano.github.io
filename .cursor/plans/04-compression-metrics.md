# Plan: Compression Metrics (Quality Assurance)

## Problem
Layer 1 neurons are **compressed** versions of Layer 2 learning documents. But there's no way to measure:
- How much information is lost in compression?
- Are neuron descriptions accurate to their source documents?
- When Layer 2 evolves, how stale is Layer 1?
- Which neurons need updating?

Without metrics, the two-layer system slowly diverges and trust erodes.

## Solution
Calculate compression metrics for each learning document and neuron, enabling quality assurance.

---

## Implementation

### Step 1: Compression Analyzer
Create `memory/utils/compression-analyzer.js`:

```javascript
const fs = require('fs');
const path = require('path');

class CompressionAnalyzer {
  constructor(learningsDir, nodesPath) {
    this.learningsDir = learningsDir;
    this.nodesPath = nodesPath;
  }

  // Analyze a single learning document
  analyzeLearning(learningPath) {
    const content = fs.readFileSync(learningPath, 'utf8');
    
    return {
      sourceFile: path.basename(learningPath),
      wordCount: this.countWords(content),
      charCount: content.length,
      sectionCount: this.countSections(content),
      codeBlocks: this.countCodeBlocks(content),
      links: this.extractLinks(content),
      keyTopics: this.extractKeyTopics(content),
      structure: this.analyzeStructure(content)
    };
  }

  // Analyze how well neurons represent their source documents
  analyzeNeuronCompression(neuron, learningContent) {
    const neuronText = neuron.label + ' ' + (neuron.attributes?.description || '');
    const neuronWords = this.countWords(neuronText);
    const learningWords = this.countWords(learningContent);

    // Simple metric: how many key terms from learning appear in neuron?
    const keyTerms = this.extractKeyTopics(learningContent);
    const matchedTerms = keyTerms.filter(term => 
      neuronText.toLowerCase().includes(term.toLowerCase())
    );

    return {
      neuronId: neuron.id,
      neuronLabel: neuron.label,
      compressionRatio: neuronWords / learningWords,
      termCoverage: matchedTerms.length / keyTerms.length,
      matchedTerms: matchedTerms,
      missingTerms: keyTerms.filter(t => !matchedTerms.includes(t)),
      quality: this.assessQuality(neuronWords / learningWords, matchedTerms.length / keyTerms.length)
    };
  }

  assessQuality(ratio, coverage) {
    // Quality score: 0-100
    // Based on compression ratio and term coverage
    const ratioScore = Math.min(ratio * 100, 50); // Max 50 points for not compressing too much
    const coverageScore = coverage * 50; // Max 50 points for term coverage
    return Math.round(ratioScore + coverageScore);
  }

  countWords(text) {
    return text.trim().split(/\s+/).length;
  }

  countSections(text) {
    return (text.match(/^##\s/gm) || []).length;
  }

  countCodeBlocks(text) {
    return (text.match(/```/g) || []).length / 2;
  }

  extractLinks(text) {
    const matches = text.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
    return matches.map(m => {
      const match = m.match(/\[([^\]]+)\]\(([^)]+)\)/);
      return { title: match[1], url: match[2] };
    });
  }

  extractKeyTopics(text) {
    // Simple: Extract all lines starting with **word:**
    const matches = text.match(/\*\*([^*]+)\*\*:/g) || [];
    return matches.map(m => m.replace(/\*\*|:/g, '').trim());
  }

  analyzeStructure(text) {
    return {
      hasSummary: text.includes('Summary') || text.includes('SUMMARY'),
      hasSources: text.includes('Source') || text.includes('SOURCE') || text.includes('URL'),
      hasKeyInsights: text.includes('Insight') || text.includes('Key'),
      hasNeuronRefs: text.includes('Neuron') || text.includes('neuron'),
      isWellFormatted: text.includes('##') && text.includes('```')
    };
  }
}

module.exports = CompressionAnalyzer;
```

### Step 2: Metrics Report Generator
Create `memory/utils/compression-report.js`:

```javascript
const fs = require('fs');
const path = require('path');
const CompressionAnalyzer = require('./compression-analyzer');

class CompressionReport {
  constructor(learningsDir, nodesPath) {
    this.analyzer = new CompressionAnalyzer(learningsDir, nodesPath);
    this.learningsDir = learningsDir;
    this.nodesPath = nodesPath;
  }

  generateFullReport() {
    const nodes = JSON.parse(fs.readFileSync(this.nodesPath, 'utf8'));
    const learningFiles = fs.readdirSync(this.learningsDir)
      .filter(f => f.endsWith('.md'));

    const report = {
      generated: new Date().toISOString(),
      totalLearnings: learningFiles.length,
      learnings: [],
      overallCompression: null,
      qualityByCategory: {},
      recommendations: []
    };

    // Analyze each learning document
    for (const file of learningFiles) {
      const fullPath = path.join(this.learningsDir, file);
      const content = fs.readFileSync(fullPath, 'utf8');
      const analysis = this.analyzer.analyzeLearning(fullPath);

      // Find neurons that reference this learning
      const relatedNeurons = nodes.filter(n => 
        n.sourceDocument && n.sourceDocument.includes(file)
      );

      const compressionAnalyses = relatedNeurons.map(n => 
        this.analyzer.analyzeNeuronCompression(n, content)
      );

      const avgQuality = compressionAnalyses.length > 0
        ? Math.round(compressionAnalyses.reduce((sum, c) => sum + c.quality, 0) / compressionAnalyses.length)
        : 0;

      const learning = {
        file: file,
        analysis: analysis,
        relatedNeuronsCount: relatedNeurons.length,
        neuronCompressions: compressionAnalyses,
        avgQualityScore: avgQuality,
        healthStatus: this.getHealthStatus(avgQuality)
      };

      report.learnings.push(learning);

      // Track quality by category (inferred from file name)
      const category = file.split('-')[0];
      if (!report.qualityByCategory[category]) {
        report.qualityByCategory[category] = [];
      }
      report.qualityByCategory[category].push(avgQuality);
    }

    // Generate recommendations
    report.recommendations = this.generateRecommendations(report);

    // Calculate overall compression health
    const allScores = report.learnings.map(l => l.avgQualityScore).filter(s => s > 0);
    report.overallCompression = {
      avgQualityScore: Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length),
      healthStatus: this.getHealthStatus(Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length))
    };

    return report;
  }

  getHealthStatus(score) {
    if (score >= 80) return '✅ Excellent';
    if (score >= 60) return '⚠️ Good';
    if (score >= 40) return '⚠️ Fair';
    return '❌ Poor';
  }

  generateRecommendations(report) {
    const recommendations = [];

    // Find learning docs with low quality neurons
    for (const learning of report.learnings) {
      const poorNeurons = learning.neuronCompressions.filter(c => c.quality < 40);
      if (poorNeurons.length > 0) {
        recommendations.push({
          learning: learning.file,
          issue: `${poorNeurons.length} neurons have low quality (${poorNeurons.length}/${learning.neuronCompressions.length})`,
          severity: 'high',
          action: `Review and update: ${poorNeurons.map(n => n.neuronId).join(', ')}`
        });
      }

      // Find learning docs with missing terms
      const highMissingTerms = learning.neuronCompressions
        .filter(c => c.missingTerms.length > 2);
      if (highMissingTerms.length > 0) {
        recommendations.push({
          learning: learning.file,
          issue: `${highMissingTerms.length} neurons missing key terms`,
          severity: 'medium',
          action: `Expand neuron descriptions to include: ${highMissingTerms.map(c => c.missingTerms.join(', ')).join('; ')}`
        });
      }
    }

    return recommendations;
  }

  printReport(report) {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║           COMPRESSION METRICS QUALITY REPORT                   ║
║                                                                ║
║  Measures how well Layer 1 neurons represent Layer 2 learning  ║
╚════════════════════════════════════════════════════════════════╝

Generated: ${report.generated}

OVERALL HEALTH: ${report.overallCompression.healthStatus} (${report.overallCompression.avgQualityScore}/100)

─────────────────────────────────────────────────────────────────

LEARNING DOCUMENTS (${report.learnings.length}):
${report.learnings.map(l => `
  📄 ${l.file}
     Words: ${l.analysis.wordCount}
     Neurons: ${l.relatedNeuronsCount}
     Avg Quality: ${l.avgQualityScore}/100 ${l.healthStatus}
     ${l.neuronCompressions.map(nc => 
       `  - ${nc.neuronId}: ${nc.quality}/100 (coverage: ${Math.round(nc.termCoverage * 100)}%)`
     ).join('\n     ')}
`).join('')}

─────────────────────────────────────────────────────────────────

RECOMMENDATIONS (${report.recommendations.length}):
${report.recommendations.length > 0
  ? report.recommendations.map(r => `
  [${r.severity.toUpperCase()}] ${r.learning}
    Issue: ${r.issue}
    Action: ${r.action}
  `).join('')
  : '  ✅ No issues found'
}

─────────────────────────────────────────────────────────────────
    `);
  }

  saveReport(report, outputPath) {
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    return outputPath;
  }
}

module.exports = CompressionReport;
```

### Step 3: Scheduled Quality Checks
Update `.cursor/plan-source-document-integration.md` with:

```markdown
### Future: Periodic Compression Analysis

On Friday of each week:
1. Run CompressionReport across all Layer 2 documents
2. Generate quality metrics
3. Flag neurons needing updates (quality < 50)
4. Generate recommendations
5. Notify user of any issues
```

### Step 4: UI Integration
In neural mind visualization:

```javascript
// Show quality badge on neurons
<div class="quality-badge">
  {quality >= 80 && '✅ Excellent'}
  {quality >= 60 && quality < 80 && '⚠️ Good'}
  {quality >= 40 && quality < 60 && '⚠️ Fair'}
  {quality < 40 && '❌ Poor'}
</div>

// Show compression metrics in neuron inspector
<CompressionMetrics
  compressionRatio={0.05}
  termCoverage={0.8}
  quality={75}
  missingTerms={['websocket', 'handshake']}
/>
```

---

## Benefits

✅ **Quality Assurance:** Know if neurons are up-to-date with their source docs  
✅ **Gap Detection:** Identify which neurons are under-describing their learning  
✅ **Maintenance:** Prioritize which neurons to update  
✅ **Trust:** Verify that compression doesn't lose critical information  
✅ **Growth:** Track improvement over time as system matures  

---

## Metrics Explained

**Compression Ratio:** Word count of neuron / word count of learning
- Good: 0.02–0.10 (captures essence without being too detailed)
- Bad: <0.01 (oversimplified) or >0.20 (not compressed enough)

**Term Coverage:** % of key topics from learning that appear in neuron
- Good: >75% (neuron describes main concepts)
- Bad: <50% (neuron misses critical topics)

**Quality Score:** Weighted combination of ratio + coverage
- 80+: Excellent (neurons capture the learning well)
- 60–79: Good (acceptable compression)
- 40–59: Fair (consider expanding neuron description)
- <40: Poor (neuron needs major revision)

---

## Success Criteria

- [x] CompressionAnalyzer measures neuron vs learning quality
- [ ] CompressionReport generates full system assessment
- [ ] Quality badges visible in UI for all neurons
- [ ] Recommendations auto-generated weekly
- [ ] Poor-quality neurons flagged for review
- [ ] Metrics tracked over time (trend analysis)

---

## Time Estimate

- Analyzer class: 25 min
- Report generator: 20 min
- UI integration: 20 min
- Testing and refinement: 15 min
- **Total: ~80 min**

---

**Created:** Feb 24, 2026 11:23 GMT+7  
**Status:** Ready for Cursor implementation
