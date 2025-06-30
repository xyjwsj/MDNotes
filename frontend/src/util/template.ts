const wxpContent = "```abc\n" +
    "X: 24\n" +
    "T: Clouds Thicken\n" +
    "C: Paul Rosen\n" +
    "S: Copyright 2005, Paul Rosen\n" +
    "M: 6/8\n" +
    "L: 1/8\n" +
    "Q: 3/8=116\n" +
    "R: Creepy Jig\n" +
    "K: Em\n" +
    "|:\"Em\"EEE E2G|\"C7\"_B2A G2F|\"Em\"EEE E2G|\\\\\n" +
    "\"C7\"_B2A \"B7\"=B3|\"Em\"EEE E2G|\n" +
    "\"C7\"_B2A G2F|\"Em\"GFE \"D (Bm7)\"F2D|\\\\\n" +
    "1\"Em\"E3-E3:|2\"Em\"E3-E2B|:\"Em\"e2e gfe|\n" +
    "\"G\"g2ab3|\"Em\"gfeg2e|\"D\"fedB2A|\"Em\"e2e gfe|\\\\\n" +
    "\"G\"g2ab3|\"Em\"gfe\"D\"f2d|\"Em\"e3-e3:|\n" +
    "```";
const gsContent =
    "$$\n" +
    "\\frac{1}{\n" +
    "  \\Bigl(\\sqrt{\\phi \\sqrt{5}}-\\phi\\Bigr) e^{\n" +
    "  \\frac25 \\pi}} = 1+\\frac{e^{-2\\pi}} {1+\\frac{e^{-4\\pi}} {\n" +
    "    1+\\frac{e^{-6\\pi}}\n" +
    "    {1+\\frac{e^{-8\\pi}}{1+\\cdots}}\n" +
    "  }\n" +
    "}";

const lctContent =
    "```mermaid\n" +
    "graph TB\n" +
    "    c1-->a2\n" +
    "    subgraph one\n" +
    "    a1-->a2\n" +
    "    end\n" +
    "    subgraph two\n" +
    "    b1-->b2\n" +
    "    end\n" +
    "    subgraph three\n" +
    "    c1-->c2\n" +
    "    end";

const ntContent =
    "```mindmap\n" +
    "- 教程\n" +
    "- 语法指导\n" +
    "  - 普通内容\n" +
    "  - 提及用户\n" +
    "  - 表情符号 Emoji\n" +
    "    - 一些表情例子\n" +
    "  - 大标题 - Heading 3\n" +
    "    - Heading 4\n" +
    "      - Heading 5\n" +
    "        - Heading 6\n" +
    "  - 图片\n" +
    "  - 代码块\n" +
    "    - 普通\n" +
    "    - 语法高亮支持\n" +
    "      - 演示 Go 代码高亮\n" +
    "      - 演示 Java 高亮\n" +
    "  - 有序、无序、任务列表\n" +
    "    - 无序列表\n" +
    "    - 有序列表\n" +
    "    - 任务列表\n" +
    "  - 表格\n" +
    "- 快捷键";

const sxtContent =
    "```mermaid\n" +
    "sequenceDiagram\n" +
    "    Alice->>John: Hello John, how are you?\n" +
    "    loop Every minute\n" +
    "        John-->>Alice: Great!\n" +
    "    end";

const gttContent =
    "```mermaid\n" +
    "gantt\n" +
    "    title A Gantt Diagram\n" +
    "    dateFormat  YYYY-MM-DD\n" +
    "    section Section\n" +
    "    A task           :a1, 2019-01-01, 30d\n" +
    "    Another task     :after a1  , 20d\n" +
    "    section Another\n" +
    "    Task in sec      :2019-01-12  , 12d\n" +
    "    another task      : 24d";

const graphvizContent =
    "```graphviz\n" +
    "digraph finite_state_machine {\n" +
    "    rankdir=LR;\n" +
    '    size="8,5"\n' +
    "    node [shape = doublecircle]; S;\n" +
    "    node [shape = point ]; qi\n" +
    "\n" +
    "    node [shape = circle];\n" +
    "    qi -> S;\n" +
    '    S  -> q1 [ label = "a" ];\n' +
    '    S  -> S  [ label = "a" ];\n' +
    '    q1 -> S  [ label = "a" ];\n' +
    '    q1 -> q2 [ label = "ddb" ];\n' +
    '    q2 -> q1 [ label = "b" ];\n' +
    '    q2 -> q2 [ label = "b" ];\n' +
    "}";

const chartsContent =
    "```mermaid\n" +
    "pie\n" +
    "    title Browser Market Share\n" +
    "    \"Chrome\" : 65\n" +
    "    \"Safari\" : 15\n" +
    "    \"Firefox\" : 10\n" +
    "    \"Other\" : 10\n" +
    "```"

export {
    wxpContent,
    gsContent,
    lctContent,
    ntContent,
    sxtContent,
    gttContent,
    graphvizContent,
    chartsContent
}