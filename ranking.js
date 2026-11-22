// =====================================================
//  オンラインランキング
//  Firebase の Firestore（クラウドのデータベース）に、みんなのスコアを保存する。
//  Firebase のライブラリは使わず、fetch でFirestoreの「REST API」に直接お願いを送る。
// =====================================================

// ↓↓↓ Firebaseコンソールの firebaseConfig から apiKey と projectId を写す ↓↓↓
const FIREBASE = {
  apiKey: 'AIzaSyA8ZFnzER4_rRO0xf4AA0YZ9lTIJWJmRUU',
  projectId: 'ninja-shooting-c41f7',
};
// ↑↑↑ ここまで ↑↑↑

const RANKING_ENABLED = !!(FIREBASE.apiKey && FIREBASE.projectId);   // 設定がなければランキングは出さない
const RANK_COLLECTION = 'scores';   // スコアをしまう場所（コレクション）の名前
const NAME_MAX = 8;                 // 名前の最大文字数

function firestoreUrl(suffix) {
  return `https://firestore.googleapis.com/v1/projects/${FIREBASE.projectId}` +
         `/databases/(default)/documents${suffix}?key=${FIREBASE.apiKey}`;
}

// Firestoreにお願い（POST）を送り、返事（JSON）を受け取る
async function firestorePost(suffix, body) {
  const res = await fetch(firestoreUrl(suffix), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Firestore ' + res.status + ' ' + await res.text());
  return res.json();
}

// スコア1件ごとの名前（ID）。20文字のランダムな英数字
function randomId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 20; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

// 名前を整える：制御文字を消し、前後の空白を取り、最大 NAME_MAX 文字に
function cleanName(raw) {
  const s = String(raw || '').replace(/[\u0000-\u001f\u007f]/g, '').trim();
  const chars = Array.from(s).slice(0, NAME_MAX);   // Array.from で絵文字なども1文字として数える
  return chars.join('') || '名無し';
}

// スコアを1件追加する。追加したスコアのIDを返す
async function submitScore(name, score, year) {
  const id = randomId();
  await firestorePost(':commit', {
    writes: [{
      update: {
        name: `projects/${FIREBASE.projectId}/databases/(default)/documents/${RANK_COLLECTION}/${id}`,
        fields: {
          name:  { stringValue: name },
          score: { integerValue: String(score) },
          year:  { integerValue: String(year) },
        },
      },
      currentDocument: { exists: false },   // 新しく作るだけ（上書きはしない）
      updateTransforms: [{ fieldPath: 'createdAt', setToServerValue: 'REQUEST_TIME' }],   // 登録した時刻はサーバーが付ける
    }],
  });
  return id;
}

// 上位 n 件を取り出す
async function fetchTop(n = 5) {
  const rows = await firestorePost(':runQuery', {
    structuredQuery: {
      from: [{ collectionId: RANK_COLLECTION }],
      orderBy: [{ field: { fieldPath: 'score' }, direction: 'DESCENDING' }],
      limit: n,
    },
  });
  return rows.filter(r => r.document).map(r => ({
    id: r.document.name.split('/').pop(),
    name: r.document.fields.name.stringValue,
    score: Number(r.document.fields.score.integerValue),
  }));
}

// 件数を数える（moreThan を渡すと「その点数より高い」件数）
async function countScores(moreThan) {
  const query = { from: [{ collectionId: RANK_COLLECTION }] };
  if (moreThan !== undefined) {
    query.where = { fieldFilter: {
      field: { fieldPath: 'score' }, op: 'GREATER_THAN', value: { integerValue: String(moreThan) },
    } };
  }
  const res = await firestorePost(':runAggregationQuery', {
    structuredAggregationQuery: { structuredQuery: query, aggregations: [{ alias: 'n', count: {} }] },
  });
  return Number(res[0].result.aggregateFields.n.integerValue);
}

// 自分の順位 ＝「自分より高い点数の件数」＋1（同じ点数は同じ順位）
async function fetchMyRank(score) {
  const [higher, total] = await Promise.all([countScores(score), countScores()]);
  return { rank: higher + 1, total };
}
