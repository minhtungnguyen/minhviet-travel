# MV Operating System - Volume 01: Brand Strategy

Bộ tài liệu nền tảng dùng chung cho Minh Việt Group và các thương hiệu/sản phẩm: Minh Việt Travel, MIVIGO, Minh Việt Booking, Checkin và các sản phẩm AI tương lai.

## Mục đích

- Làm "Hiến pháp thương hiệu" cho đội ngũ, nhà cung cấp và AI Agent.
- Giúp Claude Code/Claude Terminal đọc trực tiếp, tra cứu và áp dụng khi xây website, app, CRM, CMS, nội dung, quy trình và AI.
- Bảo đảm mọi quyết định sản phẩm và truyền thông thống nhất với Brand DNA, Brand Positioning, Brand Personality và Brand Governance.

## Cấu trúc

- `CLAUDE.md`: quy tắc bắt buộc Claude phải đọc trước khi làm việc.
- `docs/VOLUME_01_BRAND_STRATEGY.md`: tài liệu chính gồm 16 chương.
- `docs/AI_BRAND_CONSTITUTION.md`: bản tách riêng để dùng cho AI Agent.
- `templates/decision-scorecard.md`: biểu mẫu đánh giá sáng kiến.
- `templates/ai-agent-identity-card.md`: hồ sơ bắt buộc cho mỗi AI Agent.
- `templates/executive-checklist.md`: cổng kiểm tra trước khi phê duyệt.
- `prompts/claude-terminal-handoff.txt`: lệnh bàn giao mẫu cho Claude trong terminal.

## Cách dùng với Claude Code/Claude Terminal trên Windows

Sao chép toàn bộ thư mục này vào:

```text
D:\AIPROJECTS\MV-OPERATING-SYSTEM\brand-strategy
```

Mở PowerShell:

```powershell
cd D:\AIPROJECTS\MV-OPERATING-SYSTEM\brand-strategy
claude
```

Sau đó dán nội dung trong `prompts/claude-terminal-handoff.txt`.

## Nguyên tắc nguồn chuẩn

Trong phạm vi chiến lược thương hiệu, `docs/VOLUME_01_BRAND_STRATEGY.md` là nguồn chuẩn. Khi tài liệu khác mâu thuẫn với tài liệu này, Claude phải báo mâu thuẫn và xin quyết định thay vì tự chọn.
