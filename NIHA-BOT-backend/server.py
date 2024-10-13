from flask import Flask, request, Response, jsonify
from flask_cors import CORS
import openai
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId
import json
import traceback
import logging
import os
import speech_recognition as sr  # Add this import for speech recognition

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000'])  # Adjust the origin as needed

# Set your OpenAI API key from environment variable
# openai.api_key = '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'

# MongoDB connection
mongo_client = MongoClient("mongodb://localhost:27017/")
db = mongo_client['chatbot_db']
conversation_collection = db['conversations']

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@app.route('/chat/<username>', methods=['POST'])
def chat(username):
    data = request.json
    conversation_id = data.get('conversation_id')
    messages = data.get('messages', [])

    if not messages:
        return 'No messages provided', 400

    def generate():
        nonlocal conversation_id, username
        try:
            # Call OpenAI API with the entire conversation history
            response = openai.ChatCompletion.create(
                model='gpt-3.5-turbo',
                messages=messages,
                stream=True
            )

            bot_response = ''
            for chunk in response:
                if 'choices' in chunk and len(chunk['choices']) > 0:
                    content = chunk['choices'][0].get('delta', {}).get('content')
                    if content:
                        bot_response += content
                        yield f"data: {json.dumps({'content': content})}\n\n"

            # Save the conversation after generating the full response
            if not conversation_id:
                conversation = {
                    'created_at': datetime.now(),
                    'updated_at': datetime.now(),
                    'messages': messages + [{'role': 'assistant', 'content': bot_response}],
                    'username': username
                }
                result = conversation_collection.insert_one(conversation)
                conversation_id = str(result.inserted_id)
                logger.info(f"New conversation created with ID: {conversation_id}")
            else:
                conversation_collection.update_one(
                    {'_id': ObjectId(conversation_id), 'username': username},
                    {
                        '$set': {
                            'messages': messages + [{'role': 'assistant', 'content': bot_response}],
                            'updated_at': datetime.now(),
                            'username': username
                        }
                    }
                )
                logger.info(f"Conversation updated with ID: {conversation_id}")

            yield f"data: {json.dumps({'conversation_id': conversation_id})}\n\n"
            yield "data: [DONE]\n\n"

        except Exception as e:
            logger.error(f"Error in chat: {str(e)}")
            error_details = traceback.format_exc()
            yield f"data: {json.dumps({'error': str(e), 'details': error_details})}\n\n"
            yield "data: [DONE]\n\n"

    return Response(generate(), content_type='text/event-stream')

@app.route('/conversations/<username>', methods=['GET'])
def get_conversations(username):
    try:
        conversations = list(conversation_collection.find(
            {'username': username},
            {'messages': {'$slice': -1}, 'created_at': 1, 'updated_at': 1}
        ))
        for conv in conversations:
            conv['_id'] = str(conv['_id'])
            conv['last_message'] = conv['messages'][0]['content'] if conv.get('messages') else ''
            del conv['messages']
        logger.info(f"Retrieved {len(conversations)} conversations for user {username}")
        return jsonify(conversations)
    except Exception as e:
        logger.error(f"Error retrieving conversations for user {username}: {str(e)}")
        return jsonify({'error': 'Failed to retrieve conversations'}), 500

@app.route('/conversation/<conversation_id>', methods=['GET'])
def get_conversation(conversation_id):
    try:
        conversation = conversation_collection.find_one({'_id': ObjectId(conversation_id)})
        if conversation:
            conversation['_id'] = str(conversation['_id'])
            return jsonify(conversation)
        return jsonify({'error': 'Conversation not found'}), 404
    except Exception as e:
        logger.error(f"Error retrieving conversation {conversation_id}: {str(e)}")
        return jsonify({'error': 'Failed to retrieve conversation'}), 500

@app.route('/conversation/<conversation_id>', methods=['DELETE'])
def delete_conversation(conversation_id):
    try:
        result = conversation_collection.delete_one({'_id': ObjectId(conversation_id)})
        if result.deleted_count:
            return jsonify({'message': 'Conversation deleted successfully'}), 200
        else:
            return jsonify({'message': 'Conversation not found'}), 404
    except Exception as e:
        logger.error(f"Error deleting conversation {conversation_id}: {str(e)}")
        return jsonify({'error': 'Failed to delete conversation'}), 500

@app.route('/conversations', methods=['POST'])
def create_conversation():
    data = request.json
    username = data.get('username', 'Guest')

    try:
        conversation = {
            'created_at': datetime.now(),
            'updated_at': datetime.now(),
            'messages': [],
            'username': username
        }
        result = conversation_collection.insert_one(conversation)
        conversation_id = str(result.inserted_id)
        logger.info(f"New conversation created with ID: {conversation_id}")
        return jsonify({'conversation_id': conversation_id}), 201
    except Exception as e:
        logger.error(f"Error creating conversation: {str(e)}")
        return jsonify({'error': 'Failed to create conversation'}), 500

@app.route('/chat_sessions/<username>', methods=['GET'])
def get_chat_sessions(username):
    try:
        # Fetch conversations for the specific user
        conversations = list(conversation_collection.find({'username': username}))
        for conv in conversations:
            conv['_id'] = str(conv['_id'])
        return jsonify(conversations)
    except Exception as e:
        logger.error(f"Error retrieving chat sessions for user {username}: {str(e)}")
        return jsonify({'error': 'Failed to retrieve chat sessions'}), 500


if __name__ == '__main__':
    app.run(port=2000, debug=True)
