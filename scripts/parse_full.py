import urllib.request
import html
import re
import json

def strip_tags(text):
    text = re.sub(r'<br\s*/?>', ' ', text, flags=re.IGNORECASE)
    text = re.sub(r'</p>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = html.unescape(text)
    # clean multiple spaces
    text = re.sub(r'[ \t]+', ' ', text)
    # clean leading/trailing spaces on lines
    lines = [l.strip() for l in text.split('\n')]
    return '\n'.join([l for l in lines if l]).strip()

def parse_all():
    pages = [
        (1, 1, 100, "https://svata-cesta.cz/Urednicka/Urednicka_zkouska_1.html"),
        (2, 101, 200, "https://svata-cesta.cz/Urednicka/Urednicka_zkouska_2.html"),
        (3, 201, 300, "https://svata-cesta.cz/Urednicka/Urednicka_zkouska_3.html")
    ]
    
    questions = []
    
    for page_idx, q_min, q_max, url in pages:
        print(f"Reading page {page_idx}...")
        raw = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})).read().decode("utf-8", errors="replace")
        unescaped = html.unescape(raw)
        
        for q_id in range(q_min, q_max + 1):
            next_id = q_id + 1
            # Search start
            # Match either <a name="q_id"> or "<big>q_id. " or similar
            patterns = [
                rf'<a\s+name=[\"\']?{q_id}[\"\']?>',
                rf'(?:<big>|<br\s*/?>|<td>|<tr>|\n|^)\s*{q_id}\.\s+'
            ]
            m_start = None
            for p in patterns:
                m_start = re.search(p, unescaped, re.IGNORECASE)
                if m_start:
                    break
            
            if not m_start:
                m_start = re.search(rf'\b{q_id}\.\s+[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]', unescaped)
                
            if not m_start:
                print(f"ERROR: Could not find start of Q{q_id}")
                continue
                
            start_pos = m_start.start()
            
            # Find next question
            if q_id < q_max:
                next_patterns = [
                    rf'<a\s+name=[\"\']?{next_id}[\"\']?>',
                    rf'(?:<big>|<br\s*/?>|<td>|<tr>|\n|^)\s*{next_id}\.\s+'
                ]
                m_end = None
                for np in next_patterns:
                    m_end = re.search(np, unescaped[start_pos + 15:], re.IGNORECASE)
                    if m_end:
                        break
                if m_end:
                    end_pos = start_pos + 15 + m_end.start()
                else:
                    end_pos = start_pos + 4000
            else:
                end_pos = unescaped.find("</body>", start_pos)
                if end_pos == -1:
                    end_pos = start_pos + 6000
                    
            chunk = unescaped[start_pos:end_pos]
            
            # Now let's parse chunk
            # 1. Question text: from "q_id. " until "a)"
            m_q = re.search(rf'(?:{q_id}\.\s*)(.*?)(?=<br[^>]*>\s*(?:<span[^>]*>)?\s*a\)|<p[^>]*>\s*(?:<span[^>]*>)?\s*a\)|(?:<span[^>]*>)?\s*a\))', chunk, re.DOTALL | re.IGNORECASE)
            
            q_text = ""
            if m_q:
                q_text = strip_tags(m_q.group(1))
            else:
                # fallback
                m_q2 = re.search(rf'{q_id}\.\s*(.*?)(?=\ba\))', chunk, re.DOTALL)
                if m_q2:
                    q_text = strip_tags(m_q2.group(1))

            # Remove any trailing / leading artifacts
            q_text = re.sub(r'^\s*\d+\.\s*', '', q_text).strip()
            
            # 2. Options: find a), b), c)
            # Find where a), b), c) are in the HTML chunk
            # Also determine which one is marked with bold (style="font-weight: bold" or <b> or <strong>)
            
            # Let's search options
            opt_a_match = re.search(r'(?:<span[^>]*font-weight:\s*bold[^>]*>|<b>|<strong>)?\s*a\)\s*(.*?)(?=(?:<br\s*/?>|\n)*\s*(?:<span[^>]*font-weight:\s*bold[^>]*>|<b>|<strong>)?\s*b\)|$)', chunk, re.DOTALL | re.IGNORECASE)
            opt_b_match = re.search(r'(?:<span[^>]*font-weight:\s*bold[^>]*>|<b>|<strong>)?\s*b\)\s*(.*?)(?=(?:<br\s*/?>|\n)*\s*(?:<span[^>]*font-weight:\s*bold[^>]*>|<b>|<strong>)?\s*c\)|$)', chunk, re.DOTALL | re.IGNORECASE)
            # Option c goes until </big> or <p> or <table or Zdůvodnění or end of options
            opt_c_match = re.search(r'(?:<span[^>]*font-weight:\s*bold[^>]*>|<b>|<strong>)?\s*c\)\s*(.*?)(?=(?:<br\s*/?>\s*)*\s*(?:</big>|<p|<div|<span style="color|<b>Zdůvodnění|$))', chunk, re.DOTALL | re.IGNORECASE)
            
            # Determine correct answer by inspecting whether a), b), or c) was wrapped in bold
            correct = None
            
            # Test each option letter in raw chunk
            # Check for bold tag around a)
            if re.search(r'(?:font-weight:\s*bold[^>]*>|<b>|<strong>)\s*a\)', chunk, re.IGNORECASE) or \
               re.search(r'a\)\s*<span[^>]*font-weight:\s*bold', chunk, re.IGNORECASE) or \
               re.search(r'a\)\s*<b>', chunk, re.IGNORECASE):
                correct = 'a'
            elif re.search(r'(?:font-weight:\s*bold[^>]*>|<b>|<strong>)\s*b\)', chunk, re.IGNORECASE) or \
                 re.search(r'b\)\s*<span[^>]*font-weight:\s*bold', chunk, re.IGNORECASE) or \
                 re.search(r'b\)\s*<b>', chunk, re.IGNORECASE):
                correct = 'b'
            elif re.search(r'(?:font-weight:\s*bold[^>]*>|<b>|<strong>)\s*c\)', chunk, re.IGNORECASE) or \
                 re.search(r'c\)\s*<span[^>]*font-weight:\s*bold', chunk, re.IGNORECASE) or \
                 re.search(r'c\)\s*<b>', chunk, re.IGNORECASE):
                correct = 'c'
                
            opt_a = strip_tags(opt_a_match.group(1)) if opt_a_match else ""
            opt_b = strip_tags(opt_b_match.group(1)) if opt_b_match else ""
            opt_c = strip_tags(opt_c_match.group(1)) if opt_c_match else ""
            
            # Clean options
            opt_a = re.sub(r'^\s*a\)\s*', '', opt_a).strip()
            opt_b = re.sub(r'^\s*b\)\s*', '', opt_b).strip()
            opt_c = re.sub(r'^\s*c\)\s*', '', opt_c).strip()

            # Explanation: everything after option c up to end of chunk
            pos_c = chunk.find("c)")
            explanation = ""
            if pos_c != -1:
                # search where opt_c text ends
                remainder = chunk[pos_c:]
                # explanation starts after the option c text
                # Look for <p class= or Čl. or § or Zdůvodnění
                m_exp = re.search(r'(?:</big>|<p[^>]*>|<div[^>]*>|<span style="color)(.*)', remainder, re.DOTALL | re.IGNORECASE)
                if m_exp:
                    explanation = strip_tags(m_exp.group(0))
                else:
                    # just remainder after first line break
                    lines = remainder.splitlines()
                    if len(lines) > 1:
                        explanation = strip_tags("\n".join(lines[1:]))

            # Clean explanation of navigation links like "Zpět nahoru" or "Otázky č."
            exp_lines = []
            for l in explanation.split('\n'):
                l = l.strip()
                if not l:
                    continue
                if any(x in l.lower() for x in ["zpět nahoru", "urednicka_zkouska", "otázky č.", "obecná část", "nápověda pro přípravu"]):
                    continue
                exp_lines.append(l)
            clean_exp = '\n'.join(exp_lines).strip()
            
            # Category / Okruh
            if q_id <= 110:
                okruh_id = 1
                okruh_title = "1. okruh – Organizace a činnost veřejné správy"
            elif q_id <= 125:
                okruh_id = 2
                okruh_title = "2. okruh – Práva, povinnosti a pravidla etiky státního zaměstnance"
            elif q_id <= 275:
                okruh_id = 3
                okruh_title = "3. okruh – Právní předpisy obecně dopadající na činnost státní správy"
            else:
                okruh_id = 4
                okruh_title = "4. okruh – Právo Evropské unie"

            questions.append({
                "id": q_id,
                "question": q_text,
                "options": {
                    "a": opt_a,
                    "b": opt_b,
                    "c": opt_c
                },
                "correct": correct,
                "explanation": clean_exp,
                "okruhId": okruh_id,
                "okruhTitle": okruh_title
            })
            
    print(f"Total parsed questions: {len(questions)}")
    missing_correct = [q["id"] for q in questions if not q["correct"]]
    print(f"Questions missing correct answer flag: {len(missing_correct)}: {missing_correct}")
    empty_opts = [q["id"] for q in questions if not (q["options"]["a"] and q["options"]["b"] and q["options"]["c"])]
    print(f"Questions with empty options: {len(empty_opts)}: {empty_opts}")
    empty_q = [q["id"] for q in questions if not q["question"]]
    print(f"Questions with empty text: {len(empty_q)}: {empty_q}")
    
    with open("./scripts/parsed_sample.json", "w", encoding="utf-8") as f:
        json.dump(questions[:5], f, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    parse_all()
