Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"
$OutputEncoding = [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()

$scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Join-Path (Get-Location) "scripts" }
$root = Split-Path -Parent $scriptDir
$folder = Join-Path $root "web/assets/free-tests/physical-vs-psychological-like"
$width = 1680
$height = 2240

function Color($hex, $alpha = 255) {
  $base = [System.Drawing.ColorTranslator]::FromHtml($hex)
  return [System.Drawing.Color]::FromArgb($alpha, $base.R, $base.G, $base.B)
}

function Font($size, $style = "Regular") {
  return [System.Drawing.Font]::new("Microsoft YaHei", $size, [System.Drawing.FontStyle]::$style, [System.Drawing.GraphicsUnit]::Pixel)
}

function Rect($x, $y, $w, $h) {
  return [System.Drawing.RectangleF]::new([float]$x, [float]$y, [float]$w, [float]$h)
}

function RoundPath($rect, $radius) {
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $d = $radius * 2
  $path.AddArc($rect.X, $rect.Y, $d, $d, 180, 90)
  $path.AddArc($rect.Right - $d, $rect.Y, $d, $d, 270, 90)
  $path.AddArc($rect.Right - $d, $rect.Bottom - $d, $d, $d, 0, 90)
  $path.AddArc($rect.X, $rect.Bottom - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

function Box($g, $rect, $radius, $fill, $stroke = $null, $strokeWidth = 4) {
  $path = RoundPath $rect $radius
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

function Text($g, $value, $x, $y, $w, $h, $size, $color = "#4a2a19", $style = "Bold", $center = $false) {
  $font = Font $size $style
  $brush = [System.Drawing.SolidBrush]::new((Color $color))
  $format = [System.Drawing.StringFormat]::new()
  $format.Trimming = [System.Drawing.StringTrimming]::None
  if ($center) {
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
  }
  $g.DrawString($value, $font, $brush, (Rect $x $y $w $h), $format)
  $format.Dispose()
  $brush.Dispose()
  $font.Dispose()
}

function Canvas($rawName) {
  $rawPath = Join-Path $folder $rawName
  $source = [System.Drawing.Image]::FromFile($rawPath)
  $bmp = [System.Drawing.Bitmap]::new($width, $height)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $g.DrawImage($source, 0, 0, $width, $height)
  $source.Dispose()
  return @{ Bitmap = $bmp; Graphics = $g }
}

function Save($canvas, $name) {
  $path = Join-Path $folder $name
  $canvas.Bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $canvas.Graphics.Dispose()
  $canvas.Bitmap.Dispose()
}

function Brand($g) {
  Box $g (Rect 95 82 430 92) 28 (Color "#fffaf2" 242) (Color "#d5a987") 4
  Text $g "懂你的X学姐" 120 104 380 56 42 "#3d2416" "Bold" $true
}

function Footer($g) {
  Box $g (Rect 270 1968 1140 120) 34 (Color "#fff2ca" 248) (Color "#e2bc79") 5
  Text $g "记下你的分数，查看结果" 305 1988 1070 74 64 "#a23d4d" "Bold" $true
}

function DrawTitle($g, $title) {
  Box $g (Rect 250 225 1180 132) 28 (Color "#d7ad77" 238) (Color "#c99762") 4
  Text $g $title 280 247 1120 82 78 "#a23d4d" "Bold" $true
}

function DrawQuestions($g, $title, $questions) {
  Brand $g
  DrawTitle $g $title
  Box $g (Rect 150 430 1380 1355) 28 (Color "#fffaf0" 244) (Color "#ead5b5") 5
  $y = 535
  foreach ($q in $questions) {
    Text $g $q[0] 235 $y 1200 60 48 "#4a2a19" "Bold"
    $y += 78
    foreach ($option in $q[1]) {
      Text $g $option 285 $y 1180 54 40 "#4a2a19" "Bold"
      $y += 60
    }
    $y += 55
  }
  Footer $g
}

$questions1 = @(
  @("1. 看到对方第一眼，你最先关注的是？", @("A. 颜值、身材、穿搭等外在形象（3分）", "B. 眼神、气质、说话的感觉（2分）", "C. 说不上来，就是莫名舒服（1分）")),
  @("2. 和对方独处时，你最强烈的感受是？", @("A. 想靠近，有肢体接触的冲动（3分）", "B. 心跳加速，紧张又害羞（2分）", "C. 内心平静，觉得安心又放松（1分）")),
  @("3. 对方长时间不回消息，你的反应是？", @("A. 烦躁焦虑，只想立刻见到对方（3分）", "B. 胡思乱想，担心对方不在意自己（2分）", "C. 理解对方在忙，不会过度内耗（1分）"))
)

$questions2 = @(
  @("4. 你喜欢和对方做的事更多是？", @("A. 约会、逛街、看电影等具象互动（3分）", "B. 聊天谈心，分享日常和心事（2分）", "C. 哪怕各做各的，待在一起就好（1分）")),
  @("5. 对方犯错让你生气时，你会？", @("A. 看到脸就消气，很难真正计较（3分）", "B. 生气但舍不得凶，很快会原谅（2分）", "C. 理性沟通，希望对方真的改正（1分）")),
  @("6. 想到对方时，脑海里更多的是？", @("A. 对方的外貌、靠近的瞬间（3分）", "B. 对方的性格、有趣的言行（2分）", "C. 和对方在一起的踏实感（1分）"))
)

$questions3 = @(
  @("7. 别人夸赞对方时，你更在意？", @("A. 夸赞长相、外形条件（3分）", "B. 夸赞性格、人品教养（2分）", "C. 夸赞对方和你很般配（1分）")),
  @("8. 异地见不到对方时，你会？", @("A. 极度想念，渴望肢体陪伴（3分）", "B. 精神寄托，每天都想聊天（2分）", "C. 各自安好，见面时更珍惜（1分）")),
  @("9. 你喜欢对方的点，更多源于？", @("A. 本能的吸引，没有具体理由（3分）", "B. 相处久了，慢慢产生好感（2分）", "C. 三观契合，精神层面的共鸣（1分）"))
)

$cover = Canvas ".raw-01-cover.png"
$g = $cover.Graphics
Brand $g
Box $g (Rect 170 220 1340 560) 28 (Color "#fbedbd" 244) (Color "#e2c276") 5
Text $g "你对TA" 240 285 1200 120 96 "#4a2a19" "Bold" $true
Text $g "是生理性喜欢" 240 425 1200 130 104 "#b44758" "Bold" $true
Text $g "还是心理性喜欢？" 240 575 1200 130 104 "#4a2a19" "Bold" $true
Box $g (Rect 600 820 480 95) 30 (Color "#f5d276" 248) (Color "#d59b42") 5
Text $g "10题测一测" 620 835 440 60 54 "#3d2416" "Bold" $true
Footer $g
Save $cover "01-cover.png"

$c = Canvas ".raw-02-q1-3.png"
DrawQuestions $c.Graphics "10题自测｜第1-3题" $questions1
Save $c "02-q1-3.png"

$c = Canvas ".raw-03-q4-6.png"
DrawQuestions $c.Graphics "10题自测｜第4-6题" $questions2
Save $c "03-q4-6.png"

$c = Canvas ".raw-04-q7-9.png"
DrawQuestions $c.Graphics "10题自测｜第7-9题" $questions3
Save $c "04-q7-9.png"

$c = Canvas ".raw-05-q10-result.png"
$g = $c.Graphics
Brand $g
DrawTitle $g "10题自测｜最后1题"
Box $g (Rect 150 430 1380 1130) 28 (Color "#fffaf0" 244) (Color "#ead5b5") 5
Text $g "10. 设想未来，你更看重？" 235 535 1200 60 52 "#4a2a19" "Bold"
Text $g "A. 对方外在条件是否符合期待（3分）" 285 625 1180 54 42 "#4a2a19" "Bold"
Text $g "B. 相处是否开心快乐（2分）" 285 690 1180 54 42 "#4a2a19" "Bold"
Text $g "C. 灵魂契合，能否携手同行（1分）" 285 755 1180 54 42 "#4a2a19" "Bold"
Box $g (Rect 255 990 1170 350) 28 (Color "#fff2ca" 248) (Color "#e2bc79") 5
Text $g "10-15分：更偏心理性喜欢" 330 1080 1040 58 48 "#a23d4d" "Bold"
Text $g "16-23分：两种喜欢都有" 330 1165 1040 58 48 "#a23d4d" "Bold"
Text $g "24-30分：更偏生理性喜欢" 330 1250 1040 58 48 "#a23d4d" "Bold"
Footer $g
Save $c "05-q10-result.png"
