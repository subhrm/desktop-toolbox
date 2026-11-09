use serde::{Deserialize, Serialize};
use std::f64::consts::{E, PI};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum AngleUnit {
    Deg,
    Rad,
}

impl AngleUnit {
    pub fn from_str_opt(s: &str) -> Self {
        match s.trim().to_lowercase().as_str() {
            "rad" | "radians" => AngleUnit::Rad,
            _ => AngleUnit::Deg,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CalculatorResponse {
    pub expression: String,
    pub result: f64,
    pub formatted: String,
}

#[derive(Debug, PartialEq, Clone)]
enum Token {
    Number(f64),
    Ident(String),
    Plus,
    Minus,
    Multiply,
    Divide,
    Modulo,
    Power,
    Factorial,
    LParen,
    RParen,
    Comma,
}

struct Tokenizer<'a> {
    chars: std::iter::Peekable<std::str::Chars<'a>>,
}

impl<'a> Tokenizer<'a> {
    fn new(input: &'a str) -> Self {
        Self {
            chars: input.chars().peekable(),
        }
    }

    fn tokenize(mut self) -> Result<Vec<Token>, String> {
        let mut tokens = Vec::new();

        while let Some(&ch) = self.chars.peek() {
            if ch.is_whitespace() {
                self.chars.next();
                continue;
            }

            match ch {
                '+' => {
                    self.chars.next();
                    tokens.push(Token::Plus);
                }
                '-' | '−' => {
                    self.chars.next();
                    tokens.push(Token::Minus);
                }
                '*' | '×' | '·' => {
                    self.chars.next();
                    tokens.push(Token::Multiply);
                }
                '/' | '÷' => {
                    self.chars.next();
                    tokens.push(Token::Divide);
                }
                '%' => {
                    self.chars.next();
                    tokens.push(Token::Modulo);
                }
                '^' => {
                    self.chars.next();
                    tokens.push(Token::Power);
                }
                '!' => {
                    self.chars.next();
                    tokens.push(Token::Factorial);
                }
                '(' => {
                    self.chars.next();
                    tokens.push(Token::LParen);
                }
                ')' => {
                    self.chars.next();
                    tokens.push(Token::RParen);
                }
                ',' => {
                    self.chars.next();
                    tokens.push(Token::Comma);
                }
                '√' => {
                    self.chars.next();
                    tokens.push(Token::Ident("sqrt".to_string()));
                }
                '∛' => {
                    self.chars.next();
                    tokens.push(Token::Ident("cbrt".to_string()));
                }
                'π' => {
                    self.chars.next();
                    tokens.push(Token::Ident("pi".to_string()));
                }
                '²' => {
                    self.chars.next();
                    tokens.push(Token::Power);
                    tokens.push(Token::Number(2.0));
                }
                '³' => {
                    self.chars.next();
                    tokens.push(Token::Power);
                    tokens.push(Token::Number(3.0));
                }
                '0'..='9' | '.' => {
                    let num = self.read_number()?;
                    tokens.push(Token::Number(num));
                }
                'a'..='z' | 'A'..='Z' => {
                    let ident = self.read_ident();
                    tokens.push(Token::Ident(ident.to_lowercase()));
                }
                _ => {
                    return Err(format!("Unexpected character: '{}'", ch));
                }
            }
        }

        // Insert implicit multiplication tokens
        let processed = insert_implicit_multiplication(tokens);
        Ok(processed)
    }

    fn read_number(&mut self) -> Result<f64, String> {
        let mut s = String::new();
        let mut has_dot = false;
        let mut has_exp = false;

        while let Some(&ch) = self.chars.peek() {
            if ch.is_ascii_digit() {
                s.push(ch);
                self.chars.next();
            } else if ch == '.' {
                if has_dot {
                    return Err("Invalid number with multiple decimal points".to_string());
                }
                has_dot = true;
                s.push(ch);
                self.chars.next();
            } else if (ch == 'e' || ch == 'E') && !has_exp {
                has_exp = true;
                s.push(ch);
                self.chars.next();
                if let Some(&sign) = self.chars.peek()
                    && (sign == '+' || sign == '-')
                {
                    s.push(sign);
                    self.chars.next();
                }
            } else {
                break;
            }
        }

        s.parse::<f64>()
            .map_err(|_| format!("Invalid number literal: '{}'", s))
    }

    fn read_ident(&mut self) -> String {
        let mut s = String::new();
        while let Some(&ch) = self.chars.peek() {
            if ch.is_alphanumeric() || ch == '_' {
                s.push(ch);
                self.chars.next();
            } else {
                break;
            }
        }
        s
    }
}

// Insert multiplication between:
// Number and LParen e.g. 2(3)
// Number and Ident e.g. 2pi or 2sqrt(4)
// RParen and LParen e.g. (2)(3)
// RParen and Ident e.g. (2)pi
// Factorial and LParen e.g. 5!(2)
// Factorial and Number e.g. 5! 2
fn insert_implicit_multiplication(tokens: Vec<Token>) -> Vec<Token> {
    let mut result = Vec::with_capacity(tokens.len() * 2);

    for (i, token) in tokens.iter().enumerate() {
        if i > 0 {
            let prev = &tokens[i - 1];
            let should_insert = matches!(
                (prev, token),
                (Token::Number(_), Token::Ident(_))
                    | (Token::Number(_), Token::LParen)
                    | (Token::RParen, Token::LParen)
                    | (Token::RParen, Token::Ident(_))
                    | (Token::RParen, Token::Number(_))
                    | (Token::Factorial, Token::Number(_))
                    | (Token::Factorial, Token::LParen)
                    | (Token::Factorial, Token::Ident(_))
            );

            if should_insert {
                result.push(Token::Multiply);
            }
        }
        result.push(token.clone());
    }

    result
}

struct Parser {
    tokens: Vec<Token>,
    pos: usize,
    angle_unit: AngleUnit,
}

impl Parser {
    fn new(tokens: Vec<Token>, angle_unit: AngleUnit) -> Self {
        Self {
            tokens,
            pos: 0,
            angle_unit,
        }
    }

    fn peek(&self) -> Option<&Token> {
        self.tokens.get(self.pos)
    }

    fn next_token(&mut self) -> Option<Token> {
        if self.pos < self.tokens.len() {
            let tok = self.tokens[self.pos].clone();
            self.pos += 1;
            Some(tok)
        } else {
            None
        }
    }

    pub fn parse(&mut self) -> Result<f64, String> {
        if self.tokens.is_empty() {
            return Err("Empty expression".to_string());
        }
        let result = self.parse_additive()?;
        if let Some(tok) = self.peek() {
            return Err(format!("Unexpected token after expression: {:?}", tok));
        }
        if result.is_nan() {
            return Err("Calculation resulted in NaN (undefined)".to_string());
        }
        if result.is_infinite() {
            return Err("Calculation resulted in infinite overflow".to_string());
        }
        Ok(result)
    }

    fn parse_additive(&mut self) -> Result<f64, String> {
        let mut left = self.parse_multiplicative()?;

        while let Some(tok) = self.peek() {
            match tok {
                Token::Plus => {
                    self.next_token();
                    let right = self.parse_multiplicative()?;
                    left += right;
                }
                Token::Minus => {
                    self.next_token();
                    let right = self.parse_multiplicative()?;
                    left -= right;
                }
                _ => break,
            }
        }

        Ok(left)
    }

    fn parse_multiplicative(&mut self) -> Result<f64, String> {
        let mut left = self.parse_power()?;

        while let Some(tok) = self.peek() {
            match tok {
                Token::Multiply => {
                    self.next_token();
                    let right = self.parse_power()?;
                    left *= right;
                }
                Token::Divide => {
                    self.next_token();
                    let right = self.parse_power()?;
                    if right == 0.0 {
                        return Err("Division by zero".to_string());
                    }
                    left /= right;
                }
                Token::Modulo => {
                    self.next_token();
                    let right = self.parse_power()?;
                    if right == 0.0 {
                        return Err("Modulo by zero".to_string());
                    }
                    left = left.rem_euclid(right);
                }
                _ => break,
            }
        }

        Ok(left)
    }

    fn parse_power(&mut self) -> Result<f64, String> {
        let base = self.parse_unary()?;

        if let Some(Token::Power) = self.peek() {
            self.next_token();
            // Right associative power: a ^ b ^ c = a ^ (b ^ c)
            let exponent = self.parse_power()?;

            if base < 0.0 && exponent.fract() != 0.0 {
                return Err("Negative base with non-integer exponent".to_string());
            }
            if base == 0.0 && exponent <= 0.0 {
                return Err("Zero raised to non-positive exponent is undefined".to_string());
            }

            Ok(base.powf(exponent))
        } else {
            Ok(base)
        }
    }

    fn parse_unary(&mut self) -> Result<f64, String> {
        if let Some(tok) = self.peek() {
            match tok {
                Token::Plus => {
                    self.next_token();
                    return self.parse_unary();
                }
                Token::Minus => {
                    self.next_token();
                    let val = self.parse_unary()?;
                    return Ok(-val);
                }
                _ => {}
            }
        }

        let mut val = self.parse_primary()?;

        // Postfix operations like factorial and percentage
        while let Some(tok) = self.peek() {
            match tok {
                Token::Factorial => {
                    self.next_token();
                    val = compute_factorial(val)?;
                }
                Token::Modulo => {
                    // Check if followed by an operand. If next token is an operand/number/lparen/ident,
                    // it's binary modulo, handled in parse_multiplicative!
                    // Peek two ahead:
                    let is_postfix = matches!(
                        self.tokens.get(self.pos + 1),
                        None | Some(Token::RParen)
                            | Some(Token::Comma)
                            | Some(Token::Plus)
                            | Some(Token::Minus)
                            | Some(Token::Multiply)
                            | Some(Token::Divide)
                    );
                    if is_postfix {
                        self.next_token();
                        val /= 100.0;
                    } else {
                        break;
                    }
                }
                _ => break,
            }
        }

        Ok(val)
    }

    fn parse_primary(&mut self) -> Result<f64, String> {
        match self.next_token() {
            Some(Token::Number(n)) => Ok(n),
            Some(Token::LParen) => {
                let val = self.parse_additive()?;
                match self.next_token() {
                    Some(Token::RParen) => Ok(val),
                    _ => Err("Missing closing parenthesis ')'".to_string()),
                }
            }
            Some(Token::Ident(name)) => {
                // Check if it's a constant
                match name.as_str() {
                    "pi" => return Ok(PI),
                    "e" => return Ok(E),
                    "tau" => return Ok(PI * 2.0),
                    "phi" => return Ok((1.0 + 5.0_f64.sqrt()) / 2.0),
                    _ => {}
                }

                // If not a constant, it must be a function call with parentheses
                match self.next_token() {
                    Some(Token::LParen) => {
                        let mut args = Vec::new();
                        if let Some(Token::RParen) = self.peek() {
                            self.next_token();
                        } else {
                            loop {
                                let arg = self.parse_additive()?;
                                args.push(arg);
                                match self.peek() {
                                    Some(Token::Comma) => {
                                        self.next_token();
                                    }
                                    Some(Token::RParen) => {
                                        self.next_token();
                                        break;
                                    }
                                    _ => {
                                        return Err(format!(
                                            "Expected ',' or ')' in function call to '{}'",
                                            name
                                        ));
                                    }
                                }
                            }
                        }
                        self.call_function(&name, args)
                    }
                    _ => Err(format!("Expected '(' after function identifier '{}'", name)),
                }
            }
            Some(tok) => Err(format!("Unexpected token: {:?}", tok)),
            None => Err("Unexpected end of expression".to_string()),
        }
    }

    fn call_function(&self, name: &str, args: Vec<f64>) -> Result<f64, String> {
        let to_radians = |val: f64| -> f64 {
            match self.angle_unit {
                AngleUnit::Deg => val * PI / 180.0,
                AngleUnit::Rad => val,
            }
        };

        let from_radians = |val: f64| -> f64 {
            match self.angle_unit {
                AngleUnit::Deg => val * 180.0 / PI,
                AngleUnit::Rad => val,
            }
        };

        match (name, args.as_slice()) {
            ("sin", [x]) => {
                if self.angle_unit == AngleUnit::Deg {
                    let norm = x.rem_euclid(360.0);
                    if norm == 0.0 || (norm - 180.0).abs() < 1e-12 {
                        return Ok(0.0);
                    } else if (norm - 90.0).abs() < 1e-12 {
                        return Ok(1.0);
                    } else if (norm - 270.0).abs() < 1e-12 {
                        return Ok(-1.0);
                    }
                }
                Ok(to_radians(*x).sin())
            }
            ("cos", [x]) => {
                if self.angle_unit == AngleUnit::Deg {
                    let norm = x.rem_euclid(360.0);
                    if (norm - 90.0).abs() < 1e-12 || (norm - 270.0).abs() < 1e-12 {
                        return Ok(0.0);
                    } else if norm == 0.0 {
                        return Ok(1.0);
                    } else if (norm - 180.0).abs() < 1e-12 {
                        return Ok(-1.0);
                    }
                }
                Ok(to_radians(*x).cos())
            }
            ("tan", [x]) => {
                if self.angle_unit == AngleUnit::Deg {
                    let norm = x.rem_euclid(360.0);
                    if (norm - 90.0).abs() < 1e-12 || (norm - 270.0).abs() < 1e-12 {
                        return Err("Tangent is undefined at 90° and 270°".to_string());
                    }
                    if norm == 0.0 || (norm - 180.0).abs() < 1e-12 {
                        return Ok(0.0);
                    }
                    if (norm - 45.0).abs() < 1e-12 || (norm - 225.0).abs() < 1e-12 {
                        return Ok(1.0);
                    }
                }
                let rad = to_radians(*x);
                let cos_val = rad.cos();
                if cos_val.abs() < 1e-15 {
                    return Err("Tangent is undefined".to_string());
                }
                Ok(rad.tan())
            }
            ("asin" | "arcsin", [x]) => {
                if *x < -1.0 || *x > 1.0 {
                    return Err("arcsin input must be between -1 and 1".to_string());
                }
                Ok(from_radians(x.asin()))
            }
            ("acos" | "arccos", [x]) => {
                if *x < -1.0 || *x > 1.0 {
                    return Err("arccos input must be between -1 and 1".to_string());
                }
                Ok(from_radians(x.acos()))
            }
            ("atan" | "arctan", [x]) => Ok(from_radians(x.atan())),
            ("atan2", [y, x]) => Ok(from_radians(y.atan2(*x))),

            ("sinh", [x]) => Ok(x.sinh()),
            ("cosh", [x]) => Ok(x.cosh()),
            ("tanh", [x]) => Ok(x.tanh()),
            ("asinh", [x]) => Ok(x.asinh()),
            ("acosh", [x]) => {
                if *x < 1.0 {
                    return Err("acosh input must be >= 1".to_string());
                }
                Ok(x.acosh())
            }
            ("atanh", [x]) => {
                if *x <= -1.0 || *x >= 1.0 {
                    return Err("atanh input must be between -1 and 1 (exclusive)".to_string());
                }
                Ok(x.atanh())
            }

            ("sqrt", [x]) => {
                if *x < 0.0 {
                    return Err("Cannot calculate square root of a negative number".to_string());
                }
                Ok(x.sqrt())
            }
            ("cbrt", [x]) => Ok(x.cbrt()),
            ("root", [x, n]) => {
                if *n == 0.0 {
                    return Err("Zeroth root is undefined".to_string());
                }
                if *x < 0.0 {
                    if (n.fract() == 0.0) && (*n as i64 % 2 != 0) {
                        return Ok(-((-x).powf(1.0 / n)));
                    }
                    return Err("Cannot compute even root of negative number".to_string());
                }
                Ok(x.powf(1.0 / n))
            }
            ("pow", [x, y]) => {
                if *x < 0.0 && y.fract() != 0.0 {
                    return Err("Negative base with non-integer exponent".to_string());
                }
                Ok(x.powf(*y))
            }

            ("ln", [x]) => {
                if *x <= 0.0 {
                    return Err("Natural logarithm (ln) requires a positive number".to_string());
                }
                Ok(x.ln())
            }
            ("log" | "log10", [x]) => {
                if *x <= 0.0 {
                    return Err("Logarithm (log10) requires a positive number".to_string());
                }
                Ok(x.log10())
            }
            ("log2", [x]) => {
                if *x <= 0.0 {
                    return Err("Logarithm (log2) requires a positive number".to_string());
                }
                Ok(x.log2())
            }
            ("exp", [x]) => Ok(x.exp()),
            ("abs", [x]) => Ok(x.abs()),
            ("floor", [x]) => Ok(x.floor()),
            ("ceil", [x]) => Ok(x.ceil()),
            ("round", [x]) => Ok(x.round()),
            ("inv" | "recip", [x]) => {
                if *x == 0.0 {
                    return Err("Division by zero (1/0)".to_string());
                }
                Ok(1.0 / x)
            }
            ("fact" | "factorial", [x]) => compute_factorial(*x),
            (unknown, _) => Err(format!(
                "Unknown function '{}' with {} arguments",
                unknown,
                args.len()
            )),
        }
    }
}

fn compute_factorial(n: f64) -> Result<f64, String> {
    if n < 0.0 || n.fract() != 0.0 {
        return Err("Factorial requires a non-negative integer".to_string());
    }
    if n > 170.0 {
        return Err("Factorial overflow (maximum supported value is 170!)".to_string());
    }

    let int_n = n as u64;
    let mut acc = 1.0f64;
    for i in 2..=int_n {
        acc *= i as f64;
    }
    Ok(acc)
}

pub fn format_calculation_result(val: f64) -> String {
    if val.is_nan() {
        return "NaN".to_string();
    }
    if val.is_infinite() {
        return if val > 0.0 {
            "Infinity".to_string()
        } else {
            "-Infinity".to_string()
        };
    }

    // Clean zero representations
    if val == 0.0 || val.abs() < 1e-15 {
        return "0".to_string();
    }

    let abs_val = val.abs();
    if abs_val >= 1e14 || (abs_val < 1e-6 && abs_val > 0.0) {
        // Use scientific notation for very large or very tiny numbers
        let s = format!("{:e}", val);
        // Clean up format like 1.000000e5
        return s;
    }

    // Round to 12 significant decimals to eliminate 0.30000000000000004 artifacts
    let rounded = (val * 1e12).round() / 1e12;
    let mut s = format!("{:.12}", rounded);
    if s.contains('.') {
        while s.ends_with('0') {
            s.pop();
        }
        if s.ends_with('.') {
            s.pop();
        }
    }
    s
}

pub fn evaluate(expression: &str, angle_unit: AngleUnit) -> Result<CalculatorResponse, String> {
    let clean_expr = expression.trim();
    if clean_expr.is_empty() {
        return Err("Please enter an expression to calculate".to_string());
    }

    let tokens = Tokenizer::new(clean_expr).tokenize()?;
    let mut parser = Parser::new(tokens, angle_unit);
    let result = parser.parse()?;
    let formatted = format_calculation_result(result);

    Ok(CalculatorResponse {
        expression: clean_expr.to_string(),
        result,
        formatted,
    })
}

// Direct single/binary scientific helper
pub fn execute_operation(
    operation: &str,
    val: f64,
    second_val: Option<f64>,
    angle_unit: AngleUnit,
) -> Result<f64, String> {
    let to_rad = match angle_unit {
        AngleUnit::Deg => val * PI / 180.0,
        AngleUnit::Rad => val,
    };
    let from_rad = |r: f64| match angle_unit {
        AngleUnit::Deg => r * 180.0 / PI,
        AngleUnit::Rad => r,
    };

    match operation.to_lowercase().as_str() {
        "sin" => {
            if angle_unit == AngleUnit::Deg && val.rem_euclid(180.0) == 0.0 {
                return Ok(0.0);
            }
            Ok(to_rad.sin())
        }
        "cos" => {
            if angle_unit == AngleUnit::Deg && (val.rem_euclid(180.0) - 90.0).abs() < 1e-12 {
                return Ok(0.0);
            }
            Ok(to_rad.cos())
        }
        "tan" => {
            if angle_unit == AngleUnit::Deg && (val.rem_euclid(180.0) - 90.0).abs() < 1e-12 {
                return Err("Tangent is undefined at 90°".to_string());
            }
            Ok(to_rad.tan())
        }
        "asin" => {
            if val < -1.0 || val > 1.0 {
                return Err("asin domain is [-1, 1]".to_string());
            }
            Ok(from_rad(val.asin()))
        }
        "acos" => {
            if val < -1.0 || val > 1.0 {
                return Err("acos domain is [-1, 1]".to_string());
            }
            Ok(from_rad(val.acos()))
        }
        "atan" => Ok(from_rad(val.atan())),
        "sinh" => Ok(val.sinh()),
        "cosh" => Ok(val.cosh()),
        "tanh" => Ok(val.tanh()),
        "asinh" => Ok(val.asinh()),
        "acosh" => {
            if val < 1.0 {
                return Err("acosh domain is [1, ∞)".to_string());
            }
            Ok(val.acosh())
        }
        "atanh" => {
            if val <= -1.0 || val >= 1.0 {
                return Err("atanh domain is (-1, 1)".to_string());
            }
            Ok(val.atanh())
        }
        "sqrt" => {
            if val < 0.0 {
                return Err("Cannot take square root of negative number".to_string());
            }
            Ok(val.sqrt())
        }
        "cbrt" => Ok(val.cbrt()),
        "square" | "sqr" => Ok(val * val),
        "cube" => Ok(val * val * val),
        "recip" | "inv" => {
            if val == 0.0 {
                return Err("Division by zero (1/0)".to_string());
            }
            Ok(1.0 / val)
        }
        "ln" => {
            if val <= 0.0 {
                return Err("ln requires positive argument".to_string());
            }
            Ok(val.ln())
        }
        "log10" | "log" => {
            if val <= 0.0 {
                return Err("log10 requires positive argument".to_string());
            }
            Ok(val.log10())
        }
        "log2" => {
            if val <= 0.0 {
                return Err("log2 requires positive argument".to_string());
            }
            Ok(val.log2())
        }
        "exp" => Ok(val.exp()),
        "pow10" => Ok(10.0_f64.powf(val)),
        "pow2" => Ok(2.0_f64.powf(val)),
        "factorial" | "fact" => compute_factorial(val),
        "abs" => Ok(val.abs()),
        "neg" => Ok(-val),
        "percent" => Ok(val / 100.0),
        // Binary operations requiring second_val
        "power" | "pow" => {
            let exp = second_val.ok_or_else(|| "Second argument missing for power".to_string())?;
            if val < 0.0 && exp.fract() != 0.0 {
                return Err("Negative base with non-integer exponent".to_string());
            }
            Ok(val.powf(exp))
        }
        "root" => {
            let n = second_val.ok_or_else(|| "Second argument missing for root".to_string())?;
            if n == 0.0 {
                return Err("Zeroth root is undefined".to_string());
            }
            if val < 0.0 {
                if n.fract() == 0.0 && (n as i64 % 2 != 0) {
                    return Ok(-((-val).powf(1.0 / n)));
                }
                return Err("Cannot compute even root of negative number".to_string());
            }
            Ok(val.powf(1.0 / n))
        }
        _ => Err(format!("Unsupported scientific operation: {}", operation)),
    }
}

// Tauri command wrappers
#[tauri::command]
pub fn calculate_expression(
    expression: String,
    angle_unit: String,
) -> Result<CalculatorResponse, String> {
    let unit = AngleUnit::from_str_opt(&angle_unit);
    evaluate(&expression, unit)
}

#[tauri::command]
pub fn calculate_scientific_op(
    operation: String,
    value: f64,
    second_value: Option<f64>,
    angle_unit: String,
) -> Result<f64, String> {
    let unit = AngleUnit::from_str_opt(&angle_unit);
    execute_operation(&operation, value, second_value, unit)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_basic_arithmetic() {
        let res = evaluate("2 + 3 * 4", AngleUnit::Deg).unwrap();
        assert_eq!(res.result, 14.0);
        assert_eq!(res.formatted, "14");

        let res2 = evaluate("(10 - 2) / 4", AngleUnit::Deg).unwrap();
        assert_eq!(res2.result, 2.0);

        let res3 = evaluate("0.1 + 0.2", AngleUnit::Deg).unwrap();
        assert_eq!(res3.formatted, "0.3");
    }

    #[test]
    fn test_trig_functions() {
        let res_deg = evaluate("sin(90)", AngleUnit::Deg).unwrap();
        assert_eq!(res_deg.result, 1.0);

        let res_cos_deg = evaluate("cos(0)", AngleUnit::Deg).unwrap();
        assert_eq!(res_cos_deg.result, 1.0);

        let res_tan_deg = evaluate("tan(45)", AngleUnit::Deg).unwrap();
        assert!((res_tan_deg.result - 1.0).abs() < 1e-12);

        let res_rad = evaluate("sin(pi / 2)", AngleUnit::Rad).unwrap();
        assert!((res_rad.result - 1.0).abs() < 1e-12);
    }

    #[test]
    fn test_inverses_and_roots() {
        let res_asin = evaluate("asin(1)", AngleUnit::Deg).unwrap();
        assert_eq!(res_asin.result, 90.0);

        let res_sqrt = evaluate("sqrt(144)", AngleUnit::Deg).unwrap();
        assert_eq!(res_sqrt.result, 12.0);

        let res_cbrt = evaluate("cbrt(27)", AngleUnit::Deg).unwrap();
        assert_eq!(res_cbrt.result, 3.0);

        let res_inv = evaluate("inv(4)", AngleUnit::Deg).unwrap();
        assert_eq!(res_inv.result, 0.25);
    }

    #[test]
    fn test_powers_and_logs() {
        let res_pow = evaluate("2^3^2", AngleUnit::Deg).unwrap();
        // 2^(3^2) = 2^9 = 512
        assert_eq!(res_pow.result, 512.0);

        let res_log10 = evaluate("log10(1000)", AngleUnit::Deg).unwrap();
        assert_eq!(res_log10.result, 3.0);

        let res_ln = evaluate("ln(e)", AngleUnit::Deg).unwrap();
        assert!((res_ln.result - 1.0).abs() < 1e-12);
    }

    #[test]
    fn test_factorial_and_percentages() {
        let res_fact = evaluate("5!", AngleUnit::Deg).unwrap();
        assert_eq!(res_fact.result, 120.0);

        let res_fact_sum = evaluate("3! + 4!", AngleUnit::Deg).unwrap();
        assert_eq!(res_fact_sum.result, 6.0 + 24.0);

        let res_pct = evaluate("50%", AngleUnit::Deg).unwrap();
        assert_eq!(res_pct.result, 0.5);
    }

    #[test]
    fn test_implicit_multiplication() {
        let res1 = evaluate("2pi", AngleUnit::Deg).unwrap();
        assert!((res1.result - 2.0 * PI).abs() < 1e-12);

        let res2 = evaluate("3(4 + 1)", AngleUnit::Deg).unwrap();
        assert_eq!(res2.result, 15.0);

        let res3 = evaluate("(2 + 3)(4 + 2)", AngleUnit::Deg).unwrap();
        assert_eq!(res3.result, 30.0);
    }

    #[test]
    fn test_error_handling() {
        assert!(evaluate("1 / 0", AngleUnit::Deg).is_err());
        assert!(evaluate("sqrt(-1)", AngleUnit::Deg).is_err());
        assert!(evaluate("ln(-5)", AngleUnit::Deg).is_err());
        assert!(evaluate("asin(2)", AngleUnit::Deg).is_err());
        assert!(evaluate("(-2)^0.5", AngleUnit::Deg).is_err());
    }
}
