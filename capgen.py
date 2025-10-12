import sys
from captcha.image import ImageCaptcha

def gen_captcha(captcha_text):
    image = ImageCaptcha(width = 280, height = 90)
    data = image.generate(captcha_text)
    image.write(captcha_text, 'CAPTCHA.png')

if __name__=="__main__":
    try:
        captcha_text = sys.argv[1]
        gen_captcha(captcha_text)
    except IndexError:
        print("No text for captcha")
