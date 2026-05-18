Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"
$OutputEncoding = [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
Remove-Item Alias:R -ErrorAction SilentlyContinue

$scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Join-Path (Get-Location) "scripts" }
$root = Split-Path -Parent $scriptDir
$outDir = Join-Path $root "web/assets/free-tests/physical-vs-psychological-like"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

function C($hex) { [System.Drawing.ColorTranslator]::FromHtml($hex) }
function F($size, $style = "Regular") { [System.Drawing.Font]::new("Microsoft YaHei", $size, [System.Drawing.FontStyle]::$style, [System.Drawing.GraphicsUnit]::Pixel) }
function R($x, $y, $w, $h) { [System.Drawing.RectangleF]::new([float]$x, [float]$y, [float]$w, [float]$h) }

function Path-Round($rect, $radius) {
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $d = $radius * 2
  $path.AddArc($rect.X, $rect.Y, $d, $d, 180, 90)
  $path.AddArc($rect.Right - $d, $rect.Y, $d, $d, 270, 90)
  $path.AddArc($rect.Right - $d, $rect.Bottom - $d, $d, $d, 0, 90)
  $path.AddArc($rect.X, $rect.Bottom - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

function Box($g, $rect, $radius, $fill, $stroke = $null, $strokeWidth = 3) {
  $path = Path-Round $rect $radius
  $brush = [System.Drawing.SolidBrush]::new($fill)
  $g.FillPath($brush, $path)
  $brush.Dispose()
  if ($stroke -ne $null) {
    $pen = [System.Drawing.Pen]::new($stroke, $strokeWidth)
    $g.DrawPath($pen, $path)
    $pen.Dispose()
  }
  $path.Dispose()
}

function Text($g, $text, $font, $color, $rect, $center = $false, $middle = $false) {
  $brush = [System.Drawing.SolidBrush]::new($color)
  $format = [System.Drawing.StringFormat]::new()
  $format.Trimming = [System.Drawing.StringTrimming]::None
  if ($center) { $format.Alignment = [System.Drawing.StringAlignment]::Center }
  if ($middle) { $format.LineAlignment = [System.Drawing.StringAlignment]::Center }
  $g.DrawString($text, $font, $brush, $rect, $format)
  $format.Dispose()
  $brush.Dispose()
}

function Heart($g, $x, $y, $size, $color) {
  Text $g "♥" (F $size "Bold") $color (R $x $y ($size + 20) ($size + 20)) $true $true
}

function Bg($g) {
  $bg = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    [System.Drawing.Point]::new(0, 0),
    [System.Drawing.Point]::new(1080, 1440),
    (C "#fff1cf"),
    (C "#fbdab3")
  )
  $g.FillRectangle($bg, 0, 0, 1080, 1440)
  $bg.Dispose()

  $rand = [System.Random]::new(520)
  for ($i = 0; $i -lt 850; $i++) {
    $pen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb($rand.Next(10, 28), 116, 77, 36), 1)
    $x = $rand.Next(0, 1080)
    $y = $rand.Next(0, 1440)
    $g.DrawLine($pen, $x, $y, $x + $rand.Next(-7, 8), $y + $rand.Next(-7, 8))
    $pen.Dispose()
  }

  $tape = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(150, 226, 96, 105))
  $g.FillRectangle($tape, 792, 66, 205, 58)
  $g.FillRectangle($tape, 732, 1242, 210, 48)
  $tape.Dispose()
}

function Canvas {
  $bmp = [System.Drawing.Bitmap]::new(1080, 1440)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  Bg $g
  Box $g (R 48 56 310 72) 12 (C "#fffaf0") (C "#d8a889") 3
  Text $g "♥ 懂你的X学姐" (F 28 "Bold") (C "#4b2b1c") (R 82 75 255 44)
  Heart $g 56 875 88 (C "#ec6c75")
  Heart $g 910 220 72 (C "#e95f6d")
  Heart $g 910 1148 72 (C "#f1a43a")
  return @{ Bitmap = $bmp; Graphics = $g }
}

function Save($canvas, $name) {
  $path = Join-Path $outDir $name
  $canvas.Bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $canvas.Graphics.Dispose()
  $canvas.Bitmap.Dispose()
}

function SlideTitle($g, $left, $right) {
  Text $g $left (F 66 "Bold") (C "#4a2614") (R 104 164 420 92) $true $true
  Text $g "|" (F 58 "Bold") (C "#b16e40") (R 520 172 40 76) $true $true
  Text $g $right (F 66 "Bold") (C "#df5967") (R 568 164 408 92) $true $true
  $pen = [System.Drawing.Pen]::new((C "#df706f"), 8)
  $g.DrawLine($pen, 130, 276, 948, 276)
  $pen.Dispose()
}

function Question($g, $index, $question, $options, $y, $accent) {
  Box $g (R 76 $y 928 305) 28 (C "#fff8ec") (C "#e6b589") 3
  Box $g (R 100 ($y + 34) 78 78) 38 $accent (C "#ffffff") 5
  Text $g "$index." (F 42 "Bold") (C "#ffffff") (R 100 ($y + 34) 78 78) $true $true
  Text $g $question (F 35 "Bold") (C "#3d2416") (R 205 ($y + 40) 725 56)
  $letters = @("A.", "B.", "C.")
  for ($i = 0; $i -lt 3; $i++) {
    $oy = $y + 122 + $i * 57
    Box $g (R 216 $oy 54 42) 10 $accent $null 0
    Text $g $letters[$i] (F 27 "Bold") (C "#ffffff") (R 216 $oy 54 42) $true $true
    Text $g $options[$i] (F 29 "Bold") (C "#4a2a19") (R 292 ($oy - 2) 638 48)
  }
}

function Footer($g, $text) {
  Box $g (R 174 1315 732 66) 30 (C "#fff8e9") (C "#e2bc79") 3
  Text $g $text (F 34 "Bold") (C "#4a2a19") (R 198 1324 684 48) $true $true
}

$questions = @(
  @{ Q = "看到对方第一眼，你最先关注的是？"; A = @("颜值、身材、穿搭等外在形象（3分）", "眼神、气质、说话的感觉（2分）", "说不上来，就是莫名舒服（1分）") },
  @{ Q = "和对方独处时，你最强烈的感受是？"; A = @("想靠近，有肢体接触的冲动（3分）", "心跳加速，紧张又害羞（2分）", "内心平静，觉得安心又放松（1分）") },
  @{ Q = "对方长时间不回消息，你的反应是？"; A = @("烦躁焦虑，只想立刻见到对方（3分）", "胡思乱想，担心对方不在意自己（2分）", "理解对方在忙，不会过度内耗（1分）") },
  @{ Q = "你喜欢和对方做的事更多是？"; A = @("约会、逛街、看电影等具象互动（3分）", "聊天谈心，分享日常和心事（2分）", "哪怕各做各的，待在一起就好（1分）") },
  @{ Q = "对方犯错让你生气时，你会？"; A = @("看到脸就消气，很难真正计较（3分）", "生气但舍不得凶，很快会原谅（2分）", "理性沟通，希望对方真的改正（1分）") },
  @{ Q = "想到对方时，脑海里更多的是？"; A = @("对方的外貌、靠近的瞬间（3分）", "对方的性格、有趣的言行（2分）", "和对方在一起的踏实感（1分）") },
  @{ Q = "别人夸赞对方时，你更在意？"; A = @("夸赞长相、外形条件（3分）", "夸赞性格、人品教养（2分）", "夸赞对方和你很般配（1分）") },
  @{ Q = "异地见不到对方时，你会？"; A = @("极度想念，渴望肢体陪伴（3分）", "精神寄托，每天都想聊天（2分）", "各自安好，见面时更珍惜（1分）") },
  @{ Q = "你喜欢对方的点，更多源于？"; A = @("本能的吸引，没有具体理由（3分）", "相处久了，慢慢产生好感（2分）", "三观契合，精神层面的共鸣（1分）") },
  @{ Q = "设想未来，你更看重？"; A = @("对方外在条件是否符合期待（3分）", "相处是否开心快乐（2分）", "灵魂契合，能否携手同行（1分）") }
)

$c = Canvas
$g = $c.Graphics
Box $g (R 82 160 916 875) 10 (C "#fffaf1") $null 0
Text $g "你对TA" (F 92 "Bold") (C "#4a2614") (R 145 238 790 120) $true $true
Text $g "是生理性喜欢" (F 86 "Bold") (C "#df5967") (R 120 360 840 112) $true $true
Box $g (R 446 485 190 72) 28 (C "#efbd66") (C "#d59138") 3
Text $g "还是" (F 44 "Bold") (C "#ffffff") (R 446 492 190 58) $true $true
Text $g "心理性喜欢？" (F 86 "Bold") (C "#4a2614") (R 100 565 880 115) $true $true
Box $g (R 366 728 348 74) 24 (C "#fff0bf") (C "#e2aa4e") 3
Text $g "10题测一测" (F 42 "Bold") (C "#4a2614") (R 366 735 348 58) $true $true
Heart $g 375 832 190 (C "#e96d75")
Box $g (R 180 1045 720 164) 24 (C "#fff8ec") (C "#e1bc80") 3
Text $g "每题选最符合你真实想法的答案" (F 34 "Bold") (C "#4a2a19") (R 210 1074 660 48) $true $true
Text $g "A=3分  B=2分  C=1分" (F 34 "Bold") (C "#df5967") (R 210 1125 660 48) $true $true
Box $g (R 270 1240 540 72) 28 (C "#df706f") (C "#ffffff") 4
Text $g "往下翻开始测试 ↓" (F 38 "Bold") (C "#ffffff") (R 270 1248 540 56) $true $true
Save $c "01-cover.png"

for ($slide = 0; $slide -lt 3; $slide++) {
  $c = Canvas
  $g = $c.Graphics
  $start = $slide * 3
  $right = if ($slide -eq 0) { "第1-3题" } elseif ($slide -eq 1) { "第4-6题" } else { "第7-9题" }
  SlideTitle $g "10题自测" $right
  for ($i = 0; $i -lt 3; $i++) {
    $q = $questions[$start + $i]
    $accent = if (($i % 2) -eq 0) { C "#df6b72" } else { C "#f0a83f" }
    Question $g ($start + $i + 1) $q.Q $q.A (330 + $i * 315) $accent
  }
  $note = if ($slide -eq 2) { "还有最后 1 题，别漏啦～" } else { "记下每题分数，最后计算总分" }
  Footer $g $note
  Save $c ("0{0}-q{1}-{2}.png" -f ($slide + 2), ($start + 1), ($start + 3))
}

$c = Canvas
$g = $c.Graphics
SlideTitle $g "10题自测" "最后1题"
Question $g 10 $questions[9].Q $questions[9].A 335 (C "#df6b72")
Box $g (R 126 720 828 330) 28 (C "#fff6e7") (C "#e2bc79") 3
Text $g "做完 10 题后，把每题分数相加" (F 38 "Bold") (C "#4a2a19") (R 150 755 780 54) $true $true
Text $g "10-15分：更偏心理性喜欢，重视安心和契合。" (F 31 "Bold") (C "#4a2a19") (R 174 835 740 46)
Text $g "16-23分：生理吸引和心理好感都有。" (F 31 "Bold") (C "#4a2a19") (R 174 895 740 46)
Text $g "24-30分：更偏生理性喜欢，心动来得很快。" (F 31 "Bold") (C "#df5967") (R 174 955 740 46)
Box $g (R 146 1114 788 134) 24 (C "#3d2416") $null 0
Text $g "评论：我 XX 分，最像第 X、X、X 题" (F 38 "Bold") (C "#fff6e7") (R 170 1138 740 48) $true $true
Text $g "我按分数回复你更偏哪一种喜欢" (F 33 "Bold") (C "#f2c46d") (R 170 1192 740 42) $true $true
Footer $g "记好总分，评论区见结果 →"
Save $c "05-q10-result.png"
