"use strict"

const doctrine = require("doctrine")
const { parse } = require("comment-parser/lib")

const _ = require("lodash")

// a function to add doctorine information into comment-parse tags
function injectCommentParserToDoctrine(tagDoctrine, tagCommentParser) {
  const tag = tagDoctrine

  if (tagCommentParser) {
    // from comment-parser
    tag["typeText"] = tagCommentParser.type
  }

  return tag
}

function injectDoctrineToCommentParser(tagDoctrine, tagCommentParser) {
  const tag = tagCommentParser

  tag["title"] = tagCommentParser.tag

  // use type to store doctrine types and use typeText to store comment-parser type
  tag["typeText"] = tagCommentParser.type
  tag["type"] = tagDoctrine.type

  // doctrine uses description
  if (tagCommentParser.description === '') {
    // example: /** @callback promiseMeCoroutine */
    tag['description'] = tagDoctrine.description // tagCommentParser.name
  }

  return tag
}


function parseDoctrine(comment) {
  // doctrine doesn't support default values, so modify the comment
  // value prior to feeding it to doctrine.
  let commentValueDoctrine = comment.value
  const paramRegExp = /(@param\s+{[^}]+}\s+)\[([^=])+=[^\]]+\]/g
  commentValueDoctrine = commentValueDoctrine.replace(paramRegExp, (match, p1, p2) => {
    return `${p1}${p2}`
  })
  return doctrine.parse(commentValueDoctrine, { unwrap: true })
}

function parseCommentParser(comment) {
  // add jsdoc around the comment value so comment-parser can parse it correctly
  const commentValueCommentParser = `/*${comment.value}*/`
  return parse(commentValueCommentParser)
}

class Visitor {
  constructor({ fixerIndex, sourceCode }) {
    this.fixerIndex = fixerIndex
    this.sourceCode = sourceCode
    this.visitedComments = []
  }

  visit(node) {
    const newComments = []
    const allComments = _.uniq(_.concat(node.leadingComments || [], node.comments || [], node.trailingComments || []))

    allComments.forEach((comment) => {
      const found = this.visitedComments.find((visited) => _.isEqual(comment, visited))
      if (!found) {
        newComments.push(comment)
      }
    })

    let fixes = []
    for (const comment of newComments) {
      // Doctrine
      const resultDoctrine = parseDoctrine(comment)
      const tagsDoctrine = resultDoctrine.tags

      // Comment-Parser
      let resultCommentParser = parseCommentParser(comment)[0]

      let tagsCommentParser
      if (resultCommentParser) {
        // normally
        tagsCommentParser = resultCommentParser.tags
      } else {
        // fallback to doctrine without typeText
        tagsCommentParser = tagsDoctrine
        for (let iTag = 0; iTag < tagsDoctrine.length; iTag++) {
          tagsCommentParser[iTag] = injectCommentParserToDoctrine(tagsDoctrine[iTag], {})
        }
      }

      // final tags
      let tags = tagsCommentParser

      if (tagsCommentParser.length !== tagsDoctrine.length) {
        // happens when comment parser supports something but doctorine does not
        // console.log({ resultCommentParser, resultDoctrine })
      } else {
        // merge comment parser info into doctorine
        for (let iTag = 0; iTag < tagsDoctrine.length; iTag++) {
          tags[iTag] = injectDoctrineToCommentParser(tagsDoctrine[iTag], tagsCommentParser[iTag])
        }
      }

      let processedComment = false

      for (const tag of tags) {
        const fixer = this.fixerIndex.get(tag.title)
        if (!fixer) {
          continue
        }

        const context = {
          comment: comment,
          code: this.sourceCode,
          tags: tags,
        }
        const newFixes = fixer.getFixes(tag, node, context)
        fixes = _.concat(fixes, newFixes)

        if (newFixes.length) {
          processedComment = true
        }
      }

      if (processedComment) {
        this.visitedComments.push(comment)
      }
    }

    return fixes
  }
}
module.exports = Visitor
