import urllib.request
import html
import re
import json

def clean_html(text):
    text = re.sub(r'<br\s*/?>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = html.unescape(text)
    # clean extra whitespace
    lines = [l.strip() for l in text.split('\n')]
    return '\n'.join([l for l in lines if l])

def extract_questions():
    all_questions = []

    for page_idx in [1, 2, 3]:
        url = f"https://svata-cesta.cz/Urednicka/Urednicka_zkouska_{page_idx}.html"
        print(f"Fetching {url}...")
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        raw = urllib.request.urlopen(req).read().decode("utf-8", errors="replace")
        unescaped = html.unescape(raw)

        start_num = (page_idx - 1) * 100 + 1
        end_num = page_idx * 100

        # We will split or find blocks for each question
        for q_num in range(start_num, end_num + 1):
            next_num = q_num + 1
            
            # Find start of question q_num
            # Look for e.g. <a name="q_num"> or "q_num. "
            # Notice the anchor or text
            start_patterns = [
                rf'<a\s+name=[\"\']?{q_num}[\"\']?>',
                rf'(?:<big>|<br>|<td>|<tr>|\n|^)\s*{q_num}\.\s+'
            ]
            
            # Let's search by position
            m_start = None
            for sp in start_patterns:
                m_start = re.search(sp, unescaped, re.IGNORECASE)
                if m_start:
                    break
            
            # If not found directly, search with broader pattern
            if not m_start:
                m_start = re.search(rf'\b{q_num}\.\s+[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]', unescaped)

            if not m_start:
                print(f"FAILED to find start for Q{q_num}")
                continue

            start_pos = m_start.start()

            # Find end of question q_num (start of next question or end of list)
            if q_num < end_num:
                next_patterns = [
                    rf'<a\s+name=[\"\']?{next_num}[\"\']?>',
                    rf'(?:<big>|<br>|<td>|<tr>|\n|^)\s*{next_num}\.\s+[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]'
                ]
                m_end = None
                for np in next_patterns:
                    # search after start_pos + 10
                    m_end = re.search(np, unescaped[start_pos + 10:], re.IGNORECASE)
                    if m_end:
                        break
                if m_end:
                    end_pos = start_pos + 10 + m_end.start()
                else:
                    end_pos = start_pos + 5000
            else:
                # Last question of the page: ends before footer / table / body
                end_pos = unescaped.find("</body>", start_pos)
                if end_pos == -1:
                    end_pos = start_pos + 8000

            q_block = unescaped[start_pos:end_pos]
            
            # Let's see what is inside q_block
            # Print sample for question 1 and 2
            if q_num in [1, 2, 101, 201]:
                print(f"\n--- RAW SAMPLE Q{q_num} ---\n{q_block[:500]}\n")

if __name__ == '__main__':
    extract_questions()
